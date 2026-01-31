import { test, expect } from '@playwright/test';
import { DiagnosticCreatePage } from './pages/DiagnosticCreatePage';

// 인증은 auth.setup.ts의 storageState를 통해 처리됨
test.describe('이슈 #69: 진단 생성 프로세스 테스트', () => {

  test('대시보드에서 "새 기안 생성" 버튼 클릭 → 진단 생성 페이지로 이동', async ({ page }) => {
    // 대시보드로 이동
    await page.goto('/dashboard');

    // "새 기안 생성" 버튼 클릭
    const createButton = page.getByRole('button', { name: '+ 새 기안 생성' });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // 진단 생성 페이지로 이동 확인
    await expect(page).toHaveURL('/diagnostics/new');

    // 페이지 타이틀 확인
    await expect(page.getByRole('heading', { name: '새 진단 생성' })).toBeVisible();
  });

  test('제목, 캠페인, 도메인, 기간 입력 후 제출 → 파일 업로드 페이지로 이동', async ({ page }) => {
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

    // API 응답에서 diagnosticId 추출
    const responseBody = await response.json();
    const diagnosticId = responseBody.data.diagnosticId;

    // 파일 업로드 페이지로 이동 확인 (/dashboard/{domain}/upload?diagnosticId={id})
    await expect(page).toHaveURL(new RegExp(`/dashboard/esg/upload\\?diagnosticId=${diagnosticId}`), { timeout: 10000 });
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

  test('전체 플로우: 대시보드 → 기안 생성 → 파일 업로드 페이지', async ({ page }) => {
    // 1. 대시보드에서 시작
    await page.goto('/dashboard');

    // 2. "새 기안 생성" 버튼 클릭
    const createButton = page.getByRole('button', { name: '+ 새 기안 생성' });
    await createButton.click();

    // 3. 진단 생성 페이지 확인
    await expect(page).toHaveURL('/diagnostics/new');
    await expect(page.getByRole('heading', { name: '새 진단 생성' })).toBeVisible();

    // 4. 폼 데이터 입력
    const diagnosticPage = new DiagnosticCreatePage(page);
    const testData = {
      title: `플로우 테스트 진단 ${Date.now()}`,
      domain: 'SAFETY' as const,
      startDate: '2025-02-01',
      endDate: '2025-06-30',
    };

    await diagnosticPage.fillForm(testData);

    // 5. API 응답을 기다리며 제출
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/v1/diagnostics') && response.request().method() === 'POST'
    );
    await diagnosticPage.submit();
    const response = await responsePromise;

    // 6. API 성공 확인 (201 Created)
    expect(response.status()).toBe(201);

    // 7. API 응답에서 diagnosticId 추출
    const responseBody = await response.json();
    const diagnosticId = responseBody.data.diagnosticId;
    expect(diagnosticId).toBeGreaterThan(0);

    // 8. 파일 업로드 페이지로 이동 확인
    await expect(page).toHaveURL(`/dashboard/safety/upload?diagnosticId=${diagnosticId}`, { timeout: 10000 });

    // 9. 파일 업로드 페이지 요소 확인
    await expect(page.getByRole('heading', { name: '파일 업로드' })).toBeVisible();
  });
});
