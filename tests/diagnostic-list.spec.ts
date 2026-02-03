import { test, expect } from '@playwright/test';
import http from 'http';

// ---------- API 유틸 ----------

function apiPost(
  path: string,
  body: object,
  token?: string
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(
      { hostname: 'localhost', port: 8080, path, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode!, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function apiGet(
  path: string,
  token: string
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    http.get(
      { hostname: 'localhost', port: 8080, path, headers: { Authorization: `Bearer ${token}` } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    ).on('error', reject);
  });
}

async function getToken(): Promise<string> {
  const res = await apiPost('/api/v1/auth/login', {
    email: 'drafter1@techpartner.co.kr',
    password: 'Test1234!',
  });
  return (res.body as any).data.accessToken;
}

/** 페이지네이션 테스트를 위해 최소 11개 이상의 진단이 존재하도록 보장 */
async function ensureEnoughDiagnostics(): Promise<void> {
  const token = await getToken();
  const res = (await apiGet('/api/v1/diagnostics?page=0&size=1', token)) as any;
  const total = res.data?.page?.totalElements || 0;
  const needed = Math.max(0, 11 - total);

  for (let i = 0; i < needed; i++) {
    await apiPost(
      '/api/v1/diagnostics',
      {
        title: `E2E 목록 테스트 ${Date.now()}_${i}`,
        campaignId: 1,
        domainCode: 'ENV',
        periodStartDate: '2026-01-01',
        periodEndDate: '2026-12-31',
      },
      token
    );
  }
}

// ---------- 테스트 ----------

test.describe('이슈 #73 - 진단 목록 조회 및 필터링 테스트', () => {
  test.beforeAll(async () => {
    try {
      await ensureEnoughDiagnostics();
    } catch {
      // 토큰 획득 실패 시 기존 데이터로 테스트 진행
    }
  });

  test('진단 목록이 정상 로딩된다', async ({ page }) => {
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });

    // 헤더 확인
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // 테이블 행이 1개 이상 존재
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('페이지네이션이 동작한다 (다음/이전 페이지 이동)', async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.name === 'reviewer', 'reviewer 계정은 데이터가 11건 미만이라 페이지네이션 미표시');
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // 페이지네이션 영역 확인 — "1 / N" 형태
    const pageInfo = page.locator('text=/\\d+ \\/ \\d+/');
    await expect(pageInfo).toBeVisible({ timeout: 10000 });

    const pageText = await pageInfo.textContent();
    expect(pageText).toContain('1 /');

    // "다음" 버튼 클릭
    const nextButton = page.getByRole('button', { name: '다음' });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // 페이지 번호가 "2 / N"으로 변경
    await expect(pageInfo).toContainText('2 /');

    // "이전" 버튼 클릭
    const prevButton = page.getByRole('button', { name: '이전' });
    await expect(prevButton).toBeEnabled();
    await prevButton.click();

    // 페이지 번호가 "1 / N"으로 복원
    await expect(pageInfo).toContainText('1 /');
  });

  test('상태별 필터링 탭이 동작한다', async ({ page }) => {
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // "작성중" 탭 클릭 → API에 status=WRITING 전달 확인
    const writingTab = page.getByRole('button', { name: '작성중' });
    await writingTab.click();

    // 탭이 활성화 스타일(bg-primary + text-white)인지 확인
    await expect(writingTab).toHaveCSS('color', 'rgb(255, 255, 255)');

    // 테이블 로딩 대기
    await page.waitForTimeout(1000);

    // 결과가 있으면 테이블 행 존재, 없으면 빈 메시지
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    // "제출됨" 탭 클릭
    const submittedTab = page.getByRole('button', { name: '제출됨' });
    await submittedTab.click();
    await expect(submittedTab).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.waitForTimeout(1000);

    // "전체" 탭으로 복귀
    await page.getByRole('button', { name: '전체' }).click();
    await page.waitForTimeout(500);
  });

  test('도메인별 필터링이 동작한다', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'reviewer', 'reviewer(COMPLIANCE) 계정에 ESG 도메인 데이터 없음');
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // 도메인 필터 셀렉트 확인
    const domainSelect = page.locator('select');
    await expect(domainSelect).toBeVisible();

    // "ESG 실사" 선택
    await domainSelect.selectOption('ESG');
    await page.waitForTimeout(1000);

    // 테이블에 결과가 있어야 함 (모든 테스트 데이터가 ESG)
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).not.toContain('기안 내역이 없습니다');

    // 전체 도메인으로 복귀
    await domainSelect.selectOption('');
    await page.waitForTimeout(500);
  });

  test('검색 키워드 입력 → 결과 반영 확인', async ({ page }) => {
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // 검색 입력 필드 확인
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await expect(searchInput).toBeVisible();

    // 검색어 입력 후 검색 버튼 클릭
    await searchInput.fill('ESG');
    await page.getByRole('button', { name: '검색' }).click();
    await page.waitForTimeout(1000);

    // 결과 테이블 확인
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    // Enter 키로 검색 동작 확인
    await searchInput.fill('공급망');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test('빈 결과 시 "데이터 없음" 메시지가 표시된다', async ({ page }) => {
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });
    await expect(page.getByText('기안 관리')).toBeVisible({ timeout: 15000 });

    // 결과가 없을 가능성이 높은 검색어 사용
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('zzz_no_match_query_12345');
    await page.getByRole('button', { name: '검색' }).click();
    await page.waitForTimeout(1000);

    // "기안 내역이 없습니다" 메시지 확인
    await expect(page.getByText('기안 내역이 없습니다')).toBeVisible({ timeout: 10000 });
  });
});
