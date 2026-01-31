import { test, expect } from '@playwright/test';
import { DiagnosticCreatePage } from './pages/DiagnosticCreatePage';

// 테스트 계정 정보
const TEST_ACCOUNT = {
  email: 'drafter1@techpartner.co.kr',
  password: 'Test1234!',
};

test.describe('이슈 #69: 진단 생성 프로세스 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');

    // 실제 로그인 수행
    await page.getByPlaceholder('이메일을 입력해주세요').fill(TEST_ACCOUNT.email);
    await page.getByPlaceholder('비밀번호를 입력해주세요').fill(TEST_ACCOUNT.password);
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 대시보드로 이동 확인
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('제목, 도메인, 기간 입력 후 제출 → 성공 확인', async ({ page }) => {
    const diagnosticPage = new DiagnosticCreatePage(page);
    await diagnosticPage.goto();

    // 페이지 타이틀 확인
    await expect(diagnosticPage.pageTitle).toBeVisible();

    // 폼 데이터 입력
    const testData = {
      title: `E2E 테스트 진단 ${Date.now()}`,
      domain: 'ESG' as const,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    await diagnosticPage.fillForm(testData);

    // API 응답을 기다리며 제출
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/v1/diagnostics') && response.request().method() === 'POST'
    );
    await diagnosticPage.submit();
    const response = await responsePromise;

    // API 성공 확인 (201 Created)
    expect(response.status()).toBe(201);

    // 생성 후 상세 페이지로 이동 확인 (/diagnostics/:id)
    await expect(page).toHaveURL(/\/diagnostics\/\d+/, { timeout: 10000 });
  });

  test('필수값(제목) 누락 시 → 클라이언트 유효성 검사 메시지 확인', async ({ page }) => {
    const diagnosticPage = new DiagnosticCreatePage(page);
    await diagnosticPage.goto();

    // 제목 없이 다른 필드만 입력
    await diagnosticPage.domainSelect.selectOption('ESG');
    await diagnosticPage.startDateInput.fill('2025-01-01');
    await diagnosticPage.endDateInput.fill('2025-12-31');

    await diagnosticPage.submit();

    // 제목 유효성 검사 메시지 확인
    await diagnosticPage.expectValidationError('제목을 입력해주세요');
  });

  test('필수값(도메인) 누락 시 → 클라이언트 유효성 검사 메시지 확인', async ({ page }) => {
    const diagnosticPage = new DiagnosticCreatePage(page);
    await diagnosticPage.goto();

    // 도메인 없이 다른 필드만 입력
    await diagnosticPage.titleInput.fill('테스트 진단');
    await diagnosticPage.startDateInput.fill('2025-01-01');
    await diagnosticPage.endDateInput.fill('2025-12-31');

    await diagnosticPage.submit();

    // 도메인 유효성 검사 메시지 확인
    await diagnosticPage.expectValidationError('도메인을 선택해주세요');
  });

  test('필수값(기간) 누락 시 → 클라이언트 유효성 검사 메시지 확인', async ({ page }) => {
    const diagnosticPage = new DiagnosticCreatePage(page);
    await diagnosticPage.goto();

    // 기간 없이 다른 필드만 입력
    await diagnosticPage.titleInput.fill('테스트 진단');
    await diagnosticPage.domainSelect.selectOption('ESG');

    await diagnosticPage.submit();

    // 기간 유효성 검사 메시지 확인
    await diagnosticPage.expectValidationError('날짜 형식이 올바르지 않습니다');
  });

  test('생성 후 상세 페이지로 이동 확인', async ({ page }) => {
    const diagnosticPage = new DiagnosticCreatePage(page);
    await diagnosticPage.goto();

    // 폼 데이터 입력
    const testData = {
      title: `상태확인 테스트 진단 ${Date.now()}`,
      domain: 'SAFETY' as const,
      startDate: '2025-02-01',
      endDate: '2025-06-30',
    };

    await diagnosticPage.fillForm(testData);

    // API 응답을 기다리며 제출
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/v1/diagnostics') && response.request().method() === 'POST'
    );
    await diagnosticPage.submit();
    const response = await responsePromise;

    // API 성공 확인 (201 Created)
    expect(response.status()).toBe(201);

    // API 응답에서 diagnosticId 추출하여 검증
    const responseBody = await response.json();
    const diagnosticId = responseBody.data.diagnosticId;
    expect(diagnosticId).toBeGreaterThan(0);

    // 상세 페이지로 이동 확인 (/diagnostics/:id)
    await expect(page).toHaveURL(`/diagnostics/${diagnosticId}`, { timeout: 10000 });
  });
});
