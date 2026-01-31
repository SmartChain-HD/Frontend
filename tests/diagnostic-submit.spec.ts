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

async function getToken(): Promise<string> {
  const res = await apiPost('/api/v1/auth/login', {
    email: 'drafter1@techpartner.co.kr',
    password: 'Test1234!',
  });
  return (res.body as any).data.accessToken;
}

async function createWritingDiagnostic(): Promise<number> {
  const token = await getToken();
  const res = await apiPost(
    '/api/v1/diagnostics',
    {
      title: 'E2E 제출 테스트용 진단',
      campaignId: 1,
      domainCode: 'ENV',
      periodStartDate: '2026-01-01',
      periodEndDate: '2026-12-31',
    },
    token
  );
  return (res.body as any).data.diagnosticId;
}

// ---------- 테스트 ----------

test.describe('이슈 #72 - 결재 요청 제출 테스트', () => {
  test.describe.configure({ mode: 'serial' });

  let diagnosticId: number;

  test.beforeAll(async () => {
    diagnosticId = await createWritingDiagnostic();
  });

  test('WRITING 상태의 진단에서 제출 버튼이 표시된다', async ({ page }) => {
    await page.goto(`/diagnostics/${diagnosticId}`, { waitUntil: 'networkidle' });

    await expect(
      page.getByRole('button', { name: '결재자에게 제출' })
    ).toBeVisible({ timeout: 10000 });

    // 상태 뱃지 "작성중" 확인
    await expect(page.getByText('작성중')).toBeVisible();
  });

  test('제출 버튼 클릭 → 모달에서 결재자 ID 입력 → 제출 → 상태 변경 확인', async ({ page }) => {
    await page.goto(`/diagnostics/${diagnosticId}`, { waitUntil: 'networkidle' });

    // 제출 버튼 클릭 → 모달 오픈
    await page.getByRole('button', { name: '결재자에게 제출' }).click();
    await expect(page.getByText('진단 제출')).toBeVisible({ timeout: 5000 });

    // 결재자 ID 입력 (approver userId = 2)
    await page.getByPlaceholder('결재자 ID를 입력하세요').fill('2');

    // 코멘트 입력 (선택)
    await page.getByPlaceholder('코멘트를 입력하세요').fill('E2E 테스트 제출');

    // 제출 버튼 클릭
    await page.getByRole('button', { name: '제출', exact: true }).click();

    // 제출 성공 토스트 확인
    await expect(page.getByText('기안이 제출되었습니다')).toBeVisible({ timeout: 15000 });

    // 상태 뱃지가 "제출됨"으로 변경 확인
    await expect(page.getByText('제출됨')).toBeVisible({ timeout: 10000 });
  });

  test('이미 제출된 진단에서 제출 버튼이 숨겨진다', async ({ page }) => {
    // 위 테스트에서 제출된 진단을 다시 열기
    await page.goto(`/diagnostics/${diagnosticId}`, { waitUntil: 'networkidle' });

    // 상태 뱃지 "제출됨" 확인
    await expect(page.getByText('제출됨')).toBeVisible({ timeout: 10000 });

    // 제출 버튼이 없어야 함 (canSubmit = false)
    const submitButton = page.getByRole('button', { name: '결재자에게 제출' });
    await expect(submitButton).toBeHidden();
  });
});
