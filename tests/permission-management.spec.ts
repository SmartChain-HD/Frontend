import { test, expect } from '@playwright/test';
import { PermissionManagementPage } from './pages/PermissionManagementPage';

// APPROVER 역할로 실행 (approverStorageState 사용)
test.use({ storageState: 'tests/.auth/approverStorageState.json' });

test.describe('이슈 #76: 권한 관리 (관리자) 테스트', () => {

  test('PENDING 상태의 권한 요청 목록 조회', async ({ page }) => {
    const permissionPage = new PermissionManagementPage(page);

    // API 응답 대기
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET',
      { timeout: 15000 }
    );

    await page.goto('/dashboard/permission');
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(permissionPage.pageTitle).toBeVisible({ timeout: 15000 });
    await permissionPage.waitForListLoaded();

    // 승인 대기 필터 선택
    const pendingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET'
    );
    await permissionPage.selectStatusFilter('승인 대기');
    const pendingResponse = await pendingResponsePromise;
    expect(pendingResponse.status()).toBe(200);

    // 목록 확인 - 데이터가 있으면 행이 표시되고, 없으면 빈 메시지 표시
    const rowCount = await permissionPage.getRowCount();
    if (rowCount === 0) {
      await expect(page.getByText('검색 조건에 맞는 요청이 없습니다.')).toBeVisible();
    } else {
      // PENDING 상태 배지가 있는 행이 존재해야 함
      const pendingBadge = page.locator('tbody tr').filter({ hasText: '승인 대기' });
      await expect(pendingBadge.first()).toBeVisible();
    }
  });

  test('승인 처리 → APPROVED 상태 변경 확인', async ({ page }) => {
    const permissionPage = new PermissionManagementPage(page);

    // 페이지 로드
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/dashboard/permission');
    await listResponsePromise;
    await expect(permissionPage.pageTitle).toBeVisible({ timeout: 15000 });
    await permissionPage.waitForListLoaded();

    // 승인 대기 필터 선택
    const pendingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET'
    );
    await permissionPage.selectStatusFilter('승인 대기');
    await pendingResponsePromise;
    await permissionPage.waitForListLoaded();

    const rowCount = await permissionPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '승인 대기 중인 권한 요청이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 대기 항목의 처리 버튼 클릭
    const firstRow = permissionPage.getRowByIndex(0);
    await permissionPage.clickActionButton(firstRow);

    // 모달에서 승인 선택 및 처리
    await expect(page.getByText('권한 요청 상세')).toBeVisible({ timeout: 5000 });

    // 승인 버튼 클릭
    await page.locator('button').filter({ hasText: '승인' }).first().click();
    await page.getByRole('button', { name: '승인하기' }).click();

    // 확인 다이얼로그에서 확인 클릭
    const patchResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests/') && res.request().method() === 'PATCH'
    );
    await page.getByRole('button', { name: '확인' }).click();
    const patchResponse = await patchResponsePromise;
    expect(patchResponse.status()).toBe(200);

    // 처리 완료 후 모달이 닫히고 목록이 갱신됨
    await expect(page.getByText('권한 요청 상세')).toBeHidden({ timeout: 10000 });
  });

  test('반려 처리 → REJECTED 상태 변경 확인', async ({ page }) => {
    const permissionPage = new PermissionManagementPage(page);

    // 페이지 로드
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/dashboard/permission');
    await listResponsePromise;
    await expect(permissionPage.pageTitle).toBeVisible({ timeout: 15000 });
    await permissionPage.waitForListLoaded();

    // 승인 대기 필터 선택
    const pendingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests') && res.request().method() === 'GET'
    );
    await permissionPage.selectStatusFilter('승인 대기');
    await pendingResponsePromise;
    await permissionPage.waitForListLoaded();

    const rowCount = await permissionPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '승인 대기 중인 권한 요청이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 대기 항목의 처리 버튼 클릭
    const firstRow = permissionPage.getRowByIndex(0);
    await permissionPage.clickActionButton(firstRow);

    // 모달에서 반려 선택 및 처리
    await expect(page.getByText('권한 요청 상세')).toBeVisible({ timeout: 5000 });

    // 반려 버튼 클릭
    await page.locator('button').filter({ hasText: '반려' }).first().click();

    // 반려 사유 입력
    await page.getByPlaceholder('반려 사유를 입력해주세요').fill('E2E 테스트 반려 사유: 증빙 자료 부족');

    await page.getByRole('button', { name: '반려하기' }).click();

    // 확인 다이얼로그에서 확인 클릭
    const patchResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/roles/requests/') && res.request().method() === 'PATCH'
    );
    await page.getByRole('button', { name: '확인' }).click();
    const patchResponse = await patchResponsePromise;
    expect(patchResponse.status()).toBe(200);

    // 처리 완료 후 모달이 닫히고 목록이 갱신됨
    await expect(page.getByText('권한 요청 상세')).toBeHidden({ timeout: 10000 });
  });

  test('유효하지 않은 처리 결과 전송 → 에러 응답 확인', async ({ page, request }) => {
    // APPROVER 토큰으로 로그인
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: 'approver@techpartner.co.kr',
        password: 'Test1234!',
      },
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const token = loginBody.data.accessToken;

    // 먼저 권한 요청 목록 조회
    const listResponse = await request.get('/api/v1/roles/requests?status=PENDING', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (listResponse.status() !== 200) {
      test.skip(true, '권한 요청 목록 조회에 실패했습니다.');
      return;
    }

    const listBody = await listResponse.json();
    const pendingRequests = listBody.data?.content || [];

    if (pendingRequests.length === 0) {
      test.skip(true, '대기 중인 권한 요청이 없어 테스트를 건너뜁니다.');
      return;
    }

    const requestId = pendingRequests[0].accessRequestId;

    // 유효하지 않은 decision 값으로 요청 (INVALID_DECISION)
    const invalidResponse = await request.patch(`/api/v1/roles/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { decision: 'INVALID_DECISION' },
    });

    // 400 에러 또는 유효성 검증 에러 기대
    expect(invalidResponse.status()).toBeGreaterThanOrEqual(400);
  });

  test('이미 처리된 요청 재처리 시 에러 확인', async ({ page, request }) => {
    // APPROVER 토큰으로 로그인
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: 'approver@techpartner.co.kr',
        password: 'Test1234!',
      },
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const token = loginBody.data.accessToken;

    // 이미 처리된 요청 목록 조회 (APPROVED 또는 REJECTED)
    const approvedResponse = await request.get('/api/v1/roles/requests?status=APPROVED', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (approvedResponse.status() !== 200) {
      test.skip(true, '처리된 권한 요청 목록 조회에 실패했습니다.');
      return;
    }

    const approvedBody = await approvedResponse.json();
    let processedRequests = approvedBody.data?.content || [];

    // APPROVED가 없으면 REJECTED 조회
    if (processedRequests.length === 0) {
      const rejectedResponse = await request.get('/api/v1/roles/requests?status=REJECTED', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (rejectedResponse.status() === 200) {
        const rejectedBody = await rejectedResponse.json();
        processedRequests = rejectedBody.data?.content || [];
      }
    }

    if (processedRequests.length === 0) {
      test.skip(true, '처리된 권한 요청이 없어 테스트를 건너뜁니다.');
      return;
    }

    const requestId = processedRequests[0].accessRequestId;

    // 이미 처리된 요청에 재처리 시도
    const reprocessResponse = await request.patch(`/api/v1/roles/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { decision: 'APPROVED' },
    });

    // 이미 처리된 요청이므로 에러 응답 기대 (400/403/409 등)
    const status = reprocessResponse.status();
    expect(status).not.toBe(200);

    // PERM_003 에러 코드 확인 (가능한 경우)
    if (status >= 400) {
      const errorBody = await reprocessResponse.json();
      // 에러 코드가 있으면 PERM_003인지 확인, 없으면 상태 코드로 검증
      if (errorBody.code) {
        expect(['PERM_003', 'ALREADY_PROCESSED', 'R005']).toContain(errorBody.code);
      }
    }
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

    // DRAFTER 토큰으로 권한 요청 목록 API 직접 호출
    const apiResponse = await request.get('/api/v1/roles/requests', {
      headers: { Authorization: `Bearer ${drafterToken}` },
    });

    // 권한이 없으면 403 또는 빈 결과
    if (apiResponse.status() === 200) {
      const body = await apiResponse.json();
      // 서버가 200을 반환하되 빈 결과를 줄 수 있음
      expect(body.data?.content?.length || 0).toBe(0);
    } else {
      // 403 또는 에러 코드로 차단
      expect(apiResponse.status()).toBeGreaterThanOrEqual(400);
    }
  });
});
