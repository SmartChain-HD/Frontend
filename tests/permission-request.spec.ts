import { test, expect } from '@playwright/test';

// GUEST 계정으로 직접 로그인해야 하므로 공유 storageState 사용하지 않음
test.use({ storageState: { cookies: [], origins: [] } });

/** GUEST 계정으로 로그인하여 /permission/request 페이지 진입 */
async function loginAsGuest(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('이메일을 입력해주세요.').fill('guest@example.com');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('Test1234!');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page).toHaveURL(/\/permission\/request/, { timeout: 15000 });
}

test.describe('이슈 #67 - 권한 요청 및 상태 확인 테스트', () => {
  test('GUEST 로그인 시 권한 요청 페이지로 이동한다', async ({ page }) => {
    await loginAsGuest(page);

    // 페이지 제목 확인
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });
    // 현재 권한이 게스트임을 안내
    await expect(page.getByText('현재 권한: 게스트 권한입니다')).toBeVisible();
  });

  test('역할, 도메인, 회사 카드가 정상 렌더링된다', async ({ page }) => {
    await loginAsGuest(page);
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });

    // 역할 카드
    await expect(page.getByText('기안자')).toBeVisible();
    await expect(page.getByText('결재자')).toBeVisible();

    // 도메인 카드
    await expect(page.getByText('ESG 실사')).toBeVisible();
    await expect(page.getByText('안전보건')).toBeVisible();
    await expect(page.getByText('컴플라이언스')).toBeVisible();
  });

  test('필수 항목 미선택 시 제출 버튼이 비활성화된다', async ({ page }) => {
    await loginAsGuest(page);
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });

    // 초기 상태: 도메인과 회사 미선택 → 버튼 비활성화
    await expect(page.getByRole('button', { name: '권한요청' })).toBeDisabled();
  });

  test('도메인 선택 후에도 회사 미선택이면 버튼 비활성화', async ({ page }) => {
    await loginAsGuest(page);
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });

    // 도메인 선택
    await page.getByText('ESG 실사').click();

    // 여전히 회사 미선택 → 비활성화
    await expect(page.getByRole('button', { name: '권한요청' })).toBeDisabled();
  });

  test('모든 항목 선택 시 제출 버튼이 활성화된다 (PENDING 요청 없을 때)', async ({ page }) => {
    await loginAsGuest(page);
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });

    // 이미 PENDING 요청이 있으면 버튼은 항상 비활성화됨 → 이 경우 테스트 스킵
    const hasPending = await page.getByText('이미 대기 중인 권한 요청이 있습니다').isVisible().catch(() => false);
    if (hasPending) {
      await expect(page.getByRole('button', { name: '권한요청' })).toBeDisabled();
      return; // PENDING 상태에서는 활성화 불가 → 정상 동작 확인 후 종료
    }

    // 도메인 선택
    await page.getByText('ESG 실사').click();

    // 회사 드롭다운 열고 선택
    await page.getByText('회사를 선택해주세요.').click();
    const companyOption = page.locator('.absolute.top-full .cursor-pointer').first();
    await companyOption.click();

    // 이제 버튼 활성화
    await expect(page.getByRole('button', { name: '권한요청' })).toBeEnabled();
  });

  test('권한 요청 제출 후 상태 페이지로 이동한다', async ({ page }) => {
    await loginAsGuest(page);
    await expect(page.getByText('시스템 권한요청')).toBeVisible({ timeout: 10000 });

    // 이미 PENDING 요청이 있는 경우 경고 메시지가 뜰 수 있음
    const hasPending = await page.getByText('이미 대기 중인 권한 요청이 있습니다').isVisible().catch(() => false);

    if (hasPending) {
      // 이미 요청이 있으면 버튼이 비활성화됨 → 상태 페이지로 직접 이동해서 확인
      await page.goto('/permission/status');
      await expect(page.getByText('권한 요청 현황')).toBeVisible({ timeout: 10000 });
    } else {
      // 요청 제출
      await page.getByText('ESG 실사').click();
      await page.getByText('회사를 선택해주세요.').click();
      const companyOption = page.locator('.absolute.top-full .cursor-pointer').first();
      await companyOption.click();
      await page.getByPlaceholder('권한 요청 사유를 입력해주세요.').fill('E2E 테스트 요청');
      await page.getByRole('button', { name: '권한요청' }).click();

      await expect(page).toHaveURL(/\/permission\/status/, { timeout: 15000 });
    }
  });

  test('/permission/status 페이지에서 요청 상태가 표시된다', async ({ page }) => {
    await loginAsGuest(page);

    // 상태 페이지로 이동
    await page.goto('/permission/status');

    // 상태 페이지에서 가능한 상태: PENDING, APPROVED, REJECTED, 또는 내역 없음
    await page.waitForTimeout(3000);

    const hasPending = await page.getByText('승인 대기중').isVisible().catch(() => false);
    const hasApproved = await page.getByText('승인 완료').isVisible().catch(() => false);
    const hasRejected = await page.getByText('승인 반려').isVisible().catch(() => false);
    const hasNoRequest = await page.getByText('권한 요청 내역이 없습니다').isVisible().catch(() => false);

    // 네 가지 중 하나는 반드시 표시되어야 함
    expect(hasPending || hasApproved || hasRejected || hasNoRequest).toBeTruthy();
  });
});
