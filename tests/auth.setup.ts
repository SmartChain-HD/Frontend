import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_STATE = path.join(__dirname, '.auth/storageState.json');

const MOCK_LOGIN_RESPONSE = {
  success: true,
  message: '성공',
  data: {
    accessToken: 'mock-access-token-for-testing',
    refreshToken: 'mock-refresh-token-for-testing',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 1,
      email: 'tester@example.com',
      name: '테스터',
      role: { code: 'DRAFTER', name: '기안자' },
      domainRoles: [
        { domainCode: 'ESG', domainName: 'ESG 실사', roleCode: 'DRAFTER', roleName: '기안자' },
      ],
      company: { companyId: 1, companyName: '테스트회사' },
    },
  },
  timestamp: new Date().toISOString(),
};

setup('authenticate and save storageState', async ({ page }) => {
  // Mock the login API
  await page.route('**/v1/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LOGIN_RESPONSE),
    });
  });

  await page.goto('/login');

  // Fill in login form
  await page.getByPlaceholder('이메일을 입력해주세요.').fill('tester@example.com');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('Test1234!');

  // Submit
  await page.getByRole('button', { name: '로그인', exact: true }).click();

  // Wait for navigation to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  // Save storageState (localStorage + cookies)
  await page.context().storageState({ path: STORAGE_STATE });
});
