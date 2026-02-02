import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('이슈 #65 - 로그인 테스트', () => {
  test('유효한 계정으로 로그인 시 /dashboard로 이동한다', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('drafter1@techpartner.co.kr');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('Test1234!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('잘못된 비밀번호 입력 시 로그인 페이지에 머문다', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('drafter1@techpartner.co.kr');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('WrongPassword!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 실패 후에도 로그인 페이지에 머무름
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('GUEST 사용자 로그인 시 /permission/request로 이동한다 (guest@example.com 계정 미존재)', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('guest@example.com');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('Test1234!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await expect(page).toHaveURL(/\/permission\/request/, { timeout: 15000 });
  });
});
