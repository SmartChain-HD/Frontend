import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';

// 기본 storageState 사용 (DRAFTER 역할)
test.use({ storageState: 'tests/.auth/storageState.json' });

test.describe('이슈 #78: 대시보드 및 알림 조회 테스트', () => {

  test('메인 대시보드(/dashboard) 정상 렌더링', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await page.goto('/dashboard');
    await dashboardPage.waitForLoaded();

    // 대시보드 페이지 요소 확인
    await expect(dashboardPage.getPageHeading()).toBeVisible();
    await expect(dashboardPage.statsSection).toBeVisible();

    // 테이블 또는 콘텐츠 영역이 렌더링되었는지 확인
    const table = dashboardPage.getTable();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('ESG 대시보드 정상 렌더링', async ({ page }) => {
    await page.goto('/dashboard/esg');

    // ESG 페이지 헤딩 확인
    const heading = page.getByRole('heading', { name: 'ESG' });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 테이블 렌더링 확인
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // 테이블 헤더 확인
    await expect(page.getByText('협력사 명')).toBeVisible();
    await expect(page.getByText('기간')).toBeVisible();
    await expect(page.getByText('제출일')).toBeVisible();
    await expect(page.getByText('결과')).toBeVisible();
  });

  test('Safety 대시보드 정상 렌더링', async ({ page }) => {
    await page.goto('/dashboard/safety');

    // Safety 페이지 헤딩 확인
    const heading = page.getByRole('heading', { name: '안전보건' });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 테이블 렌더링 확인
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Compliance 대시보드 정상 렌더링', async ({ page }) => {
    await page.goto('/dashboard/compliance');

    // Compliance 페이지 헤딩 확인
    const heading = page.getByRole('heading', { name: '컴플라이언스' });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 테이블 렌더링 확인
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('알림 목록(/notifications) 조회 확인', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/v1/notifications') && res.request().method() === 'GET',
      { timeout: 15000 }
    );

    await page.goto('/notifications');
    const response = await responsePromise;

    await expect(notificationsPage.pageTitle).toBeVisible({ timeout: 15000 });
    await notificationsPage.waitForLoaded();

    // API 응답 확인
    if (response.status() !== 200) {
      // 서버 에러인 경우 에러 메시지 표시 확인
      await expect(notificationsPage.errorMessage).toBeVisible({ timeout: 5000 });
      return;
    }

    // 알림이 있거나 빈 메시지가 표시
    const notificationCount = await notificationsPage.getNotificationCount();
    if (notificationCount === 0) {
      await expect(notificationsPage.emptyMessage).toBeVisible();
    } else {
      expect(notificationCount).toBeGreaterThan(0);
    }

    // 필터 탭 확인
    await expect(notificationsPage.getFilterTab('전체')).toBeVisible();
    await expect(notificationsPage.getFilterTab('안읽음')).toBeVisible();
    await expect(notificationsPage.getFilterTab('읽음')).toBeVisible();

    // 모두 읽음 버튼 확인
    await expect(notificationsPage.markAllReadButton).toBeVisible();
  });

  test('각 대시보드 간 네비게이션 동작 확인', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // 메인 대시보드에서 시작
    await page.goto('/dashboard');
    await dashboardPage.waitForLoaded();

    // ESG 페이지로 이동
    await dashboardPage.navigateToESG();
    await expect(page.getByRole('heading', { name: 'ESG' })).toBeVisible({ timeout: 10000 });

    // Safety 페이지로 이동
    await dashboardPage.navigateToSafety();
    await expect(page.getByRole('heading', { name: '안전보건' })).toBeVisible({ timeout: 10000 });

    // Compliance 페이지로 이동
    await dashboardPage.navigateToCompliance();
    await expect(page.getByRole('heading', { name: '컴플라이언스' })).toBeVisible({ timeout: 10000 });

    // 홈으로 돌아가기
    await dashboardPage.navigateToHome();
    await expect(dashboardPage.getPageHeading()).toBeVisible({ timeout: 10000 });
  });
});
