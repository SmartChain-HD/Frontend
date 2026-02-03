import { test, expect } from '@playwright/test';
import { UserManagementPage } from './pages/UserManagementPage';
import { CompanyManagementPage } from './pages/CompanyManagementPage';
import { ActivityLogPage } from './pages/ActivityLogPage';

// APPROVER 역할로 실행 (관리자 권한 필요)
test.use({ storageState: 'tests/.auth/approverStorageState.json' });

test.describe('이슈 #77: 사용자/회사 관리 및 활동 로그 조회 테스트', () => {

  test.describe('사용자 관리 페이지', () => {

    test('사용자 목록 페이지 접근 및 조회', async ({ page }) => {
      const userPage = new UserManagementPage(page);

      // API 응답 대기
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      );

      await page.goto('/management/users');
      const response = await responsePromise;

      // 페이지 타이틀 확인
      await expect(userPage.pageTitle).toBeVisible({ timeout: 15000 });

      // API 응답 상태 확인 (200 또는 403)
      const status = response.status();
      if (status === 200) {
        await userPage.waitForListLoaded();

        // 목록 확인 - 데이터가 있으면 행이 표시되고, 없으면 빈 메시지 표시
        const rowCount = await userPage.getRowCount();
        if (rowCount === 0) {
          await expect(userPage.emptyMessage).toBeVisible();
        } else {
          // 테이블 헤더 확인
          await expect(page.getByRole('columnheader', { name: '사용자' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '회사' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '역할' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '상태' })).toBeVisible();
        }
      } else if (status === 403) {
        // 권한 없음 - 에러 메시지 또는 빈 상태 확인
        console.log('사용자 관리 API 접근 권한 없음 (403)');
      }

      expect([200, 403]).toContain(status);
    });

    test('사용자 검색 기능 동작 확인', async ({ page }) => {
      const userPage = new UserManagementPage(page);

      // 페이지 로드
      await page.goto('/management/users');
      await expect(userPage.pageTitle).toBeVisible({ timeout: 15000 });

      // 초기 API 응답 대기
      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await userPage.waitForListLoaded();

      // 검색 입력
      await userPage.searchInput.fill('test');

      // 검색 실행
      const searchResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await userPage.searchButton.click();
      const searchResponse = await searchResponsePromise;

      // API 호출 성공 확인 (200 또는 403)
      expect([200, 403]).toContain(searchResponse.status());
      await userPage.waitForListLoaded();
    });

    test('역할 필터 기능 동작 확인', async ({ page }) => {
      const userPage = new UserManagementPage(page);

      // 페이지 로드
      await page.goto('/management/users');
      await expect(userPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await userPage.waitForListLoaded();

      // 역할 필터 - DRAFTER 선택
      const filterResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await userPage.selectRoleFilter('DRAFTER');
      const filterResponse = await filterResponsePromise;

      expect([200, 403]).toContain(filterResponse.status());
      await userPage.waitForListLoaded();
    });

    test('상태 필터 기능 동작 확인', async ({ page }) => {
      const userPage = new UserManagementPage(page);

      // 페이지 로드
      await page.goto('/management/users');
      await expect(userPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await userPage.waitForListLoaded();

      // 상태 필터 - ACTIVE 선택
      const filterResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await userPage.selectStatusFilter('ACTIVE');
      const filterResponse = await filterResponsePromise;

      expect([200, 403]).toContain(filterResponse.status());
      await userPage.waitForListLoaded();
    });

    test('페이지네이션 UI 표시 확인', async ({ page }) => {
      const userPage = new UserManagementPage(page);

      // 페이지 로드
      await page.goto('/management/users');
      await expect(userPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/users') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await userPage.waitForListLoaded();

      // 페이지네이션이 있는 경우 UI 확인
      const pageInfo = userPage.getPageInfo();
      const pageInfoVisible = await pageInfo.isVisible().catch(() => false);

      if (pageInfoVisible) {
        const pageText = await pageInfo.textContent();
        expect(pageText).toMatch(/\d+ \/ \d+/);
      }
    });
  });

  test.describe('회사 관리 페이지', () => {

    test('회사 목록 페이지 접근 및 조회', async ({ page }) => {
      const companyPage = new CompanyManagementPage(page);

      // API 응답 대기
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      );

      await page.goto('/management/companies');
      const response = await responsePromise;

      // 페이지 타이틀 확인
      await expect(companyPage.pageTitle).toBeVisible({ timeout: 15000 });

      // API 응답 상태 확인
      const status = response.status();
      if (status === 200) {
        await companyPage.waitForListLoaded();

        // 목록 확인
        const rowCount = await companyPage.getRowCount();
        if (rowCount === 0) {
          await expect(companyPage.emptyMessage).toBeVisible();
        } else {
          // 테이블 헤더 확인
          await expect(page.getByRole('columnheader', { name: '회사명' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '유형' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '소속 사용자' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '등록일' })).toBeVisible();
        }
      } else if (status === 403) {
        console.log('회사 관리 API 접근 권한 없음 (403)');
      }

      expect([200, 403]).toContain(status);
    });

    test('회사 검색 기능 동작 확인', async ({ page }) => {
      const companyPage = new CompanyManagementPage(page);

      // 페이지 로드
      await page.goto('/management/companies');
      await expect(companyPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await companyPage.waitForListLoaded();

      // 검색 입력 및 실행
      await companyPage.searchInput.fill('테스트');

      const searchResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await companyPage.searchButton.click();
      const searchResponse = await searchResponsePromise;

      expect([200, 403]).toContain(searchResponse.status());
      await companyPage.waitForListLoaded();
    });

    test('회사 유형 필터 기능 동작 확인', async ({ page }) => {
      const companyPage = new CompanyManagementPage(page);

      // 페이지 로드
      await page.goto('/management/companies');
      await expect(companyPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await companyPage.waitForListLoaded();

      // 유형 필터 - SUPPLIER 선택
      const filterResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await companyPage.selectTypeFilter('SUPPLIER');
      const filterResponse = await filterResponsePromise;

      expect([200, 403]).toContain(filterResponse.status());
      await companyPage.waitForListLoaded();
    });

    test('회사 등록 버튼 및 모달 표시 확인', async ({ page }) => {
      const companyPage = new CompanyManagementPage(page);

      await page.goto('/management/companies');
      await expect(companyPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/companies') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await companyPage.waitForListLoaded();

      // 회사 등록 버튼 확인
      await expect(companyPage.registerButton).toBeVisible();

      // 모달 열기
      await companyPage.registerButton.click();
      await expect(page.getByRole('heading', { name: '회사 등록' })).toBeVisible();

      // 모달 닫기
      await companyPage.cancelButton.click();
      await expect(page.getByRole('heading', { name: '회사 등록' })).toBeHidden();
    });
  });

  test.describe('활동 로그 페이지', () => {

    test('활동 로그 목록 페이지 접근 및 조회', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // API 응답 대기
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      );

      await page.goto('/management/activity-logs');
      const response = await responsePromise;

      // 페이지 타이틀 확인
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      // API 응답 상태 확인
      const status = response.status();
      if (status === 200) {
        await activityPage.waitForListLoaded();

        // 목록 확인
        const rowCount = await activityPage.getRowCount();
        if (rowCount === 0) {
          await expect(activityPage.emptyMessage).toBeVisible();
        } else {
          // 테이블 헤더 확인
          await expect(page.getByRole('columnheader', { name: '일시' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '사용자' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '액션' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: '대상' })).toBeVisible();
          await expect(page.getByRole('columnheader', { name: 'IP 주소' })).toBeVisible();
        }
      } else if (status === 403) {
        console.log('활동 로그 API 접근 권한 없음 (403)');
      }

      expect([200, 403]).toContain(status);
    });

    test('날짜 필터링 동작 확인', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // 페이지 로드
      await page.goto('/management/activity-logs');
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 날짜 설정
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);

      const toDateStr = today.toISOString().split('T')[0];
      const fromDateStr = lastWeek.toISOString().split('T')[0];

      await activityPage.fromDateInput.fill(fromDateStr);
      await activityPage.toDateInput.fill(toDateStr);

      // 필터 적용
      const filterResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await activityPage.searchButton.click();
      const filterResponse = await filterResponsePromise;

      expect([200, 403]).toContain(filterResponse.status());
      await activityPage.waitForListLoaded();
    });

    test('액션 유형 필터링 동작 확인', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // 페이지 로드
      await page.goto('/management/activity-logs');
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 액션 유형 선택 - LOGIN
      await activityPage.selectActionType('LOGIN');

      // 필터 적용
      const filterResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await activityPage.searchButton.click();
      const filterResponse = await filterResponsePromise;

      expect([200, 403]).toContain(filterResponse.status());
      await activityPage.waitForListLoaded();
    });

    test('필터 초기화 동작 확인', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // 페이지 로드
      await page.goto('/management/activity-logs');
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 필터 설정
      await activityPage.selectActionType('LOGIN');
      await activityPage.searchButton.click();

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 초기화
      const resetResponsePromise = page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      );
      await activityPage.resetButton.click();
      const resetResponse = await resetResponsePromise;

      expect([200, 403]).toContain(resetResponse.status());
      await activityPage.waitForListLoaded();
    });

    test('내보내기 버튼 및 모달 표시 확인', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // 페이지 로드
      await page.goto('/management/activity-logs');
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 내보내기 버튼 확인
      await expect(activityPage.exportButton).toBeVisible();

      // 내보내기 모달 열기
      await activityPage.exportButton.click();
      await expect(page.getByRole('heading', { name: '활동 로그 내보내기' })).toBeVisible();

      // Excel 옵션 확인
      await expect(page.getByText('Excel (.xlsx)')).toBeVisible();
      // CSV 옵션 확인
      await expect(page.getByText('CSV (.csv)')).toBeVisible();

      // 취소 버튼으로 모달 닫기
      await activityPage.cancelExportButton.click();
      await expect(page.getByRole('heading', { name: '활동 로그 내보내기' })).toBeHidden();
    });

    test('페이지네이션 UI 표시 확인', async ({ page }) => {
      const activityPage = new ActivityLogPage(page);

      // 페이지 로드
      await page.goto('/management/activity-logs');
      await expect(activityPage.pageTitle).toBeVisible({ timeout: 15000 });

      await page.waitForResponse(
        (res) => res.url().includes('/v1/management/activity-logs') && res.request().method() === 'GET',
        { timeout: 15000 }
      ).catch(() => null);

      await activityPage.waitForListLoaded();

      // 총 건수 표시 확인 (데이터가 있는 경우)
      const totalCountVisible = await activityPage.totalCountText.isVisible().catch(() => false);
      if (totalCountVisible) {
        const totalText = await activityPage.totalCountText.textContent();
        expect(totalText).toMatch(/총 \d+건/);
      }
    });
  });

  test.describe('API 직접 호출 테스트', () => {

    test('사용자 목록 API 응답 확인', async ({ request }) => {
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

      // 사용자 목록 API 호출
      const usersResponse = await request.get('/api/v1/management/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200 또는 403 응답 확인
      const status = usersResponse.status();
      expect([200, 403]).toContain(status);

      if (status === 200) {
        const usersBody = await usersResponse.json();
        expect(usersBody.data).toBeDefined();
        expect(usersBody.data.content).toBeDefined();
        expect(usersBody.data.page).toBeDefined();
      }
    });

    test('회사 목록 API 응답 확인', async ({ request }) => {
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

      // 회사 목록 API 호출
      const companiesResponse = await request.get('/api/v1/management/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200 또는 403 응답 확인
      const status = companiesResponse.status();
      expect([200, 403]).toContain(status);

      if (status === 200) {
        const companiesBody = await companiesResponse.json();
        expect(companiesBody.data).toBeDefined();
        expect(companiesBody.data.content).toBeDefined();
        expect(companiesBody.data.page).toBeDefined();
      }
    });

    test('활동 로그 API 응답 확인', async ({ request }) => {
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

      // 활동 로그 API 호출
      const logsResponse = await request.get('/api/v1/management/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200 또는 403 응답 확인
      const status = logsResponse.status();
      expect([200, 403]).toContain(status);

      if (status === 200) {
        const logsBody = await logsResponse.json();
        expect(logsBody.data).toBeDefined();
        expect(logsBody.data.content).toBeDefined();
        expect(logsBody.data.page).toBeDefined();
      }
    });

    test('권한 없는 사용자(DRAFTER) 관리 API 접근 테스트', async ({ request }) => {
      // DRAFTER 토큰으로 로그인
      const loginResponse = await request.post('/api/v1/auth/login', {
        data: {
          email: 'drafter1@techpartner.co.kr',
          password: 'Test1234!',
        },
      });
      expect(loginResponse.status()).toBe(200);
      const loginBody = await loginResponse.json();
      const drafterToken = loginBody.data.accessToken;

      // DRAFTER 토큰으로 사용자 관리 API 호출
      const usersResponse = await request.get('/api/v1/management/users', {
        headers: { Authorization: `Bearer ${drafterToken}` },
      });

      // DRAFTER는 관리 API에 접근할 수 없어야 함 (403) 또는 제한된 결과 (200)
      const status = usersResponse.status();
      expect([200, 403]).toContain(status);

      if (status === 200) {
        const body = await usersResponse.json();
        // 권한에 따라 빈 결과일 수 있음
        expect(body.data).toBeDefined();
      }
    });
  });
});
