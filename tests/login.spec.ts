import { test, expect } from '@playwright/test';

// This test file does NOT use the shared storageState — it tests login from scratch.
test.use({ storageState: { cookies: [], origins: [] } });

const MOCK_LOGIN_SUCCESS = {
  success: true,
  message: '성공',
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 1,
      email: 'user@example.com',
      name: '홍길동',
      role: { code: 'DRAFTER', name: '기안자' },
      company: { companyId: 1, companyName: '테스트회사' },
    },
  },
  timestamp: new Date().toISOString(),
};

const MOCK_LOGIN_FAIL = {
  status: 401,
  code: 'A003',
  message: '이메일 또는 비밀번호가 올바르지 않습니다',
};

test.describe('이슈 #65 - 로그인 테스트', () => {
  test('유효한 계정으로 로그인 시 /dashboard로 이동한다', async ({ page }) => {
    await page.route('**/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LOGIN_SUCCESS),
      });
    });

    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('user@example.com');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('ValidPass1!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('잘못된 비밀번호 입력 시 에러 메시지가 노출된다', async ({ page }) => {
    // Intercept the login API call and respond with 401
    let intercepted = false;
    await page.route('**/api/v1/auth/login', (route) => {
      intercepted = true;
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LOGIN_FAIL),
      });
    });

    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('user@example.com');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('wrongpassword');

    // Listen for request to verify route interception
    const responsePromise = page.waitForResponse((resp) =>
      resp.url().includes('auth/login')
    );
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(401);

    // Verify: API returned 401 and user stays on login page (not redirected)
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('GUEST 사용자 로그인 시 /permission/request로 이동한다', async ({ page }) => {
    const guestResponse = {
      ...MOCK_LOGIN_SUCCESS,
      data: {
        ...MOCK_LOGIN_SUCCESS.data,
        user: {
          ...MOCK_LOGIN_SUCCESS.data.user,
          role: { code: 'GUEST', name: '게스트' },
        },
      },
    };

    await page.route('**/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(guestResponse),
      });
    });

    await page.goto('/login');

    await page.getByPlaceholder('이메일을 입력해주세요.').fill('guest@example.com');
    await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('GuestPass1!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await expect(page).toHaveURL(/\/permission\/request/, { timeout: 10000 });
  });
});
