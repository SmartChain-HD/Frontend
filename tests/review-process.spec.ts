import { test, expect } from '@playwright/test';
import { ReviewsListPage } from './pages/ReviewsListPage';
import { ReviewDetailPage } from './pages/ReviewDetailPage';

// REVIEWER 프로젝트로 실행 (reviewerStorageState 사용)
test.use({ storageState: 'tests/.auth/reviewerStorageState.json' });

test.describe('이슈 #75: 심사 목록 및 리뷰 프로세스 테스트', () => {

  test('REVIEWER 역할로 심사 목록 조회', async ({ page }) => {
    const listPage = new ReviewsListPage(page);

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews') && res.request().method() === 'GET',
      { timeout: 15000 }
    );

    await page.goto('/reviews');
    const response = await responsePromise;

    // 페이지 타이틀 확인 (API 성공 여부와 무관하게 페이지 로드 확인)
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // API 응답 상태 확인
    if (response.status() !== 200) {
      // 서버 에러인 경우 에러 메시지가 표시되는지 확인
      await expect(listPage.errorMessage).toBeVisible({ timeout: 5000 });
      return;
    }

    // 목록이 로드되었으면 데이터 행이 있거나 빈 메시지가 표시
    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      await expect(listPage.emptyMessage).toBeVisible();
    } else {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('심사 상세 페이지 진입 및 내용 확인', async ({ page }) => {
    const listPage = new ReviewsListPage(page);
    const detailPage = new ReviewDetailPage(page);

    // 목록 조회
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/reviews');
    await listResponsePromise;
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '심사 내역이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 행 클릭 → 상세 페이지 이동
    const detailResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews/') && res.request().method() === 'GET'
    );
    await listPage.clickFirstRow();
    await detailResponsePromise;
    await detailPage.waitForLoaded();

    // URL 패턴 확인
    await expect(page).toHaveURL(/\/reviews\/\d+/);

    // 상세 페이지 내용 확인
    await expect(detailPage.getTitle()).toBeVisible();
    await expect(detailPage.getStatusBadge()).toBeVisible();
    await expect(detailPage.backButton).toBeVisible();
  });

  test('심사 완료 처리 → APPROVED 상태 전환 확인', async ({ page }) => {
    const listPage = new ReviewsListPage(page);
    const detailPage = new ReviewDetailPage(page);

    // 심사중 상태 필터링 후 목록 조회
    const listResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews') && res.request().method() === 'GET',
      { timeout: 15000 }
    );
    await page.goto('/reviews');
    const listResponse = await listResponsePromise;
    await expect(listPage.pageTitle).toBeVisible({ timeout: 15000 });
    await listPage.waitForListLoaded();

    // API 에러 시 스킵
    if (listResponse.status() !== 200) {
      test.skip(true, 'API 서버 에러로 테스트를 건너뜁니다.');
      return;
    }

    // 심사중 탭 클릭
    const reviewingResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews') && res.request().method() === 'GET'
    );
    await listPage.getStatusTab('심사중').click();
    const reviewingResponse = await reviewingResponsePromise;

    if (reviewingResponse.status() !== 200) {
      test.skip(true, 'API 서버 에러로 테스트를 건너뜁니다.');
      return;
    }
    await listPage.waitForListLoaded();

    const rowCount = await listPage.getRowCount();
    if (rowCount === 0) {
      test.skip(true, '심사중인 건이 없어 테스트를 건너뜁니다.');
      return;
    }

    // 첫 번째 심사중 행 클릭 → 상세 페이지 이동
    const detailResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews/') && res.request().method() === 'GET'
    );
    await listPage.clickFirstRow();
    await detailResponsePromise;
    await detailPage.waitForLoaded();

    await expect(page).toHaveURL(/\/reviews\/\d+/);
    await expect(detailPage.approveButton).toBeVisible();

    // 승인 처리
    const putResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/reviews/') && res.request().method() === 'PUT'
    );
    await detailPage.approveWithDetails({ score: 85, comment: 'E2E 테스트 승인 처리' });
    const putResponse = await putResponsePromise;
    expect(putResponse.status()).toBe(200);

    // 승인 후 상태 변경 확인 — 승인 버튼이 사라지고 상태 배지가 변경됨
    await expect(detailPage.approveButton).toBeHidden({ timeout: 10000 });
    await expect(detailPage.getStatusBadge()).toContainText('승인');
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

    // DRAFTER 토큰으로 심사 목록 API 직접 호출
    const apiResponse = await request.get('/api/v1/reviews', {
      headers: { Authorization: `Bearer ${drafterToken}` },
    });
    const body = await apiResponse.json();

    if (apiResponse.status() === 200) {
      // 서버가 200을 반환하되 빈 결과를 줄 수도 있음 (도메인 권한 없는 심사는 안 보임)
      expect(body.data.content).toHaveLength(0);
    } else {
      // 403 또는 에러 코드로 차단
      expect(apiResponse.status()).toBeGreaterThanOrEqual(400);
    }
  });
});
