import { test, expect } from '@playwright/test';
import { ApprovalsListPage } from './pages/ApprovalsListPage';
import { ApprovalDetailPage } from './pages/ApprovalDetailPage';

// APPROVER 프로젝트로 실행 (approverStorageState 사용)
test.use({ storageState: 'tests/.auth/approverStorageState.json' });

test.describe('이슈 #74: 결재 목록 및 승인/반려 프로세스 테스트', () => {

  test('APPROVER 역할로 결재 목록 조회', async ({ page }) => {
    const listPage = new ApprovalsListPage(page);

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET',
      { timeout: 15000 }
    );

    await page.goto('/approvals');
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // 목록이 로드되었으면 데이터 행이 있거나 빈 메시지가 표시
    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      await expect(listPage.emptyMessage).toBeVisible();
    } else {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('상세 페이지에서 승인(APPROVED) 처리 → 상태 변경 확인', async ({ page }) => {
    const listPage = new ApprovalsListPage(page);
    const detailPage = new ApprovalDetailPage(page);

    // 대기 상태 필터링 후 목록 조회
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/approvals');
    await listResponsePromise;
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // 대기 탭 클릭
    const waitingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET'
    );
    await listPage.getStatusTab('대기').click();
    const waitingResponse = await waitingResponsePromise;
    expect(waitingResponse.status()).toBe(200);
    await listPage.waitForListLoaded();

    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '대기 중인 결재 건이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 대기 행 클릭 → 상세 페이지 이동
    const detailResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals/') && res.request().method() === 'GET'
    );
    await listPage.clickFirstRow();
    await detailResponsePromise;
    await detailPage.waitForLoaded();

    await expect(page).toHaveURL(/\/approvals\/\d+/);
    await expect(detailPage.approveButton).toBeVisible();

    // 승인 처리
    const patchResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals/') && res.request().method() === 'PATCH'
    );
    await detailPage.approveWithComment('E2E 테스트 승인');
    const patchResponse = await patchResponsePromise;
    expect(patchResponse.status()).toBe(200);

    // 승인 후 상태 변경 확인 — 승인 버튼이 사라지고 상태 배지가 변경됨
    await expect(detailPage.approveButton).toBeHidden({ timeout: 10000 });
    await expect(detailPage.getStatusBadge()).toContainText('승인');
  });

  test('반려(REJECTED) 처리 → 사유 입력 후 상태 변경 확인', async ({ page }) => {
    const listPage = new ApprovalsListPage(page);
    const detailPage = new ApprovalDetailPage(page);

    // 대기 상태 필터링 후 목록 조회
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/approvals');
    await listResponsePromise;
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // 대기 탭 클릭
    const waitingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET'
    );
    await listPage.getStatusTab('대기').click();
    const waitingResponse = await waitingResponsePromise;
    expect(waitingResponse.status()).toBe(200);
    await listPage.waitForListLoaded();

    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '대기 중인 결재 건이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 대기 행 클릭 → 상세 페이지 이동
    const detailResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals/') && res.request().method() === 'GET'
    );
    await listPage.clickFirstRow();
    await detailResponsePromise;
    await detailPage.waitForLoaded();

    await expect(page).toHaveURL(/\/approvals\/\d+/);
    await expect(detailPage.rejectButton).toBeVisible();

    // 반려 처리 (사유 입력)
    const patchResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals/') && res.request().method() === 'PATCH'
    );
    await detailPage.rejectWithReason('E2E 테스트 반려 사유: 증빙 자료 부족', 'E2E 테스트 반려 코멘트');
    const patchResponse = await patchResponsePromise;
    expect(patchResponse.status()).toBe(200);

    // 반려 후 상태 변경 확인
    await expect(detailPage.rejectButton).toBeHidden({ timeout: 10000 });
    await expect(detailPage.getStatusBadge()).toContainText('반려');
  });

  test('이미 처리된 요청 재처리 시 에러 확인', async ({ page }) => {
    const listPage = new ApprovalsListPage(page);
    const detailPage = new ApprovalDetailPage(page);

    // 승인 또는 반려 탭에서 이미 처리된 건 찾기
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/approvals');
    await listResponsePromise;
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // 승인됨 탭 클릭
    const approvedResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals') && res.request().method() === 'GET'
    );
    await listPage.getStatusTab('승인').click();
    const approvedResponse = await approvedResponsePromise;
    expect(approvedResponse.status()).toBe(200);
    await listPage.waitForListLoaded();

    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '처리된 결재 건이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 이미 처리된 건의 상세 페이지 진입
    const detailResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/approvals/') && res.request().method() === 'GET'
    );
    await listPage.clickFirstRow();
    await detailResponsePromise;
    await detailPage.waitForLoaded();

    // 이미 승인된 건에는 승인/반려 버튼이 보이지 않아야 함
    await expect(detailPage.approveButton).toBeHidden();
    await expect(detailPage.rejectButton).toBeHidden();

    // 직접 API 호출로 이미 처리된 건에 재처리 시도
    const approvalId = page.url().match(/\/approvals\/(\d+)/)?.[1];
    expect(approvalId).toBeTruthy();

    const apiResponse = await page.request.patch(`/api/v1/approvals/${approvalId}`, {
      data: { decision: 'APPROVED', comment: '재처리 시도' },
    });

    // 이미 처리된 건이므로 에러 응답 (400/403/409 등)
    const status = apiResponse.status();
    expect(status).not.toBe(200);
  });

  test('권한 없는 사용자(DRAFTER) 접근 → 에러 확인', async ({ page, request }) => {
    // DRAFTER 계정으로 로그인 토큰 발급
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: 'drafter1@techpartner.co.kr',
        password: 'Test1234!',
      },
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const drafterToken = loginBody.data.accessToken;

    // DRAFTER 토큰으로 결재 목록 API 직접 호출
    const apiResponse = await request.get('/api/v1/approvals', {
      headers: { Authorization: `Bearer ${drafterToken}` },
    });
    const body = await apiResponse.json();

    if (apiResponse.status() === 200) {
      // 서버가 200을 반환하되 빈 결과를 줄 수도 있음 (도메인 권한 없는 결재는 안 보임)
      expect(body.data.content).toHaveLength(0);
    } else {
      // 403 또는 에러 코드로 차단
      expect(apiResponse.status()).toBeGreaterThanOrEqual(400);
    }
  });
});
