import { test, expect } from '@playwright/test';

// No shared auth — signup tests run unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

// ── Mock Helpers ──

const mockCheckEmail = (available: boolean) => ({
  success: true,
  message: '성공',
  data: { available },
  timestamp: new Date().toISOString(),
});

const mockSendVerification = () => ({
  success: true,
  message: '인증 코드가 발송되었습니다.',
  data: { message: '인증 코드가 발송되었습니다.', expiresInSeconds: 180 },
  timestamp: new Date().toISOString(),
});

const mockVerifyEmail = (verified: boolean) => ({
  success: true,
  message: '성공',
  data: { verified },
  timestamp: new Date().toISOString(),
});

const mockRegisterSuccess = () => ({
  success: true,
  message: '회원가입이 완료되었습니다.',
  data: { userId: 99, email: 'new@example.com', name: '김테스트' },
  timestamp: new Date().toISOString(),
});

// ── Helpers ──

async function setupAllMocksForHappyPath(page: import('@playwright/test').Page) {
  await page.route('**/v1/auth/check-email', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCheckEmail(true)) }),
  );
  await page.route('**/v1/auth/send-verification', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSendVerification()) }),
  );
  await page.route('**/v1/auth/verify-email', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockVerifyEmail(true)) }),
  );
  await page.route('**/v1/auth/register', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRegisterSuccess()) }),
  );
}

/** Step1: agree and navigate to Step2 */
async function completeStep1(page: import('@playwright/test').Page) {
  await page.goto('/signup/step1');
  await page.getByText('동의함').click();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL(/\/signup\/step2/);
}

test.describe('이슈 #66 - 회원가입 플로우 테스트', () => {
  test('Step1 → Step2 → 회원가입 완료 정상 플로우', async ({ page }) => {
    await setupAllMocksForHappyPath(page);

    // Step1: 약관 동의
    await completeStep1(page);

    // Step2: 폼 입력
    await page.getByPlaceholder('이름을 입력해주세요.').fill('김테스트');
    await page.getByPlaceholder('회사 이메일을 입력해주세요.').fill('new@example.com');

    // 이메일 인증 요청
    await page.getByRole('button', { name: '인증요청' }).click();
    await expect(page.getByText('사용 가능한 이메일입니다')).toBeVisible({ timeout: 5000 });

    // 인증코드 입력 및 확인
    await page.getByPlaceholder('6자리 인증코드를 입력해주세요.').fill('123456');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('이메일 인증이 완료되었습니다').first()).toBeVisible({ timeout: 5000 });

    // 비밀번호 입력
    await page.getByPlaceholder('영문, 숫자, 특수문자 포함 8자 이상').fill('Test1234!');
    await page.getByPlaceholder('비밀번호를 다시 입력해주세요.').fill('Test1234!');

    // 회원가입 제출
    await page.getByRole('button', { name: '회원가입' }).click();

    // 성공 후 /login으로 이동
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('Step1에서 약관 미동의 시 다음으로 진행 불가', async ({ page }) => {
    await page.goto('/signup/step1');

    // 동의하지 않고 다음 클릭
    await page.getByRole('button', { name: '다음' }).click();

    // 여전히 step1에 머무름
    await expect(page).toHaveURL(/\/signup\/step1/);
  });

  test('이미 존재하는 이메일 입력 시 에러 메시지 표시', async ({ page }) => {
    await page.route('**/v1/auth/check-email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCheckEmail(false)) }),
    );

    await completeStep1(page);

    await page.getByPlaceholder('회사 이메일을 입력해주세요.').fill('existing@example.com');
    await page.getByRole('button', { name: '인증요청' }).click();

    await expect(page.getByText('이미 사용 중인 이메일입니다')).toBeVisible({ timeout: 5000 });
  });

  test('비밀번호 형식 오류 시 유효성 검사 메시지 표시', async ({ page }) => {
    await setupAllMocksForHappyPath(page);
    await completeStep1(page);

    await page.getByPlaceholder('이름을 입력해주세요.').fill('김테스트');
    await page.getByPlaceholder('회사 이메일을 입력해주세요.').fill('test@example.com');

    // 이메일 인증 완료
    await page.getByRole('button', { name: '인증요청' }).click();
    await page.getByPlaceholder('6자리 인증코드를 입력해주세요.').fill('123456');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('이메일 인증이 완료되었습니다').first()).toBeVisible({ timeout: 5000 });

    // 잘못된 비밀번호 (특수문자 없음)
    await page.getByPlaceholder('영문, 숫자, 특수문자 포함 8자 이상').fill('test1234');
    await page.getByPlaceholder('비밀번호를 다시 입력해주세요.').fill('test1234');

    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).toBeVisible({ timeout: 5000 });
  });

  test('비밀번호 불일치 시 유효성 검사 메시지 표시', async ({ page }) => {
    await setupAllMocksForHappyPath(page);
    await completeStep1(page);

    await page.getByPlaceholder('이름을 입력해주세요.').fill('김테스트');
    await page.getByPlaceholder('회사 이메일을 입력해주세요.').fill('test@example.com');

    // 이메일 인증 완료
    await page.getByRole('button', { name: '인증요청' }).click();
    await page.getByPlaceholder('6자리 인증코드를 입력해주세요.').fill('123456');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('이메일 인증이 완료되었습니다').first()).toBeVisible({ timeout: 5000 });

    // 비밀번호 불일치
    await page.getByPlaceholder('영문, 숫자, 특수문자 포함 8자 이상').fill('Test1234!');
    await page.getByPlaceholder('비밀번호를 다시 입력해주세요.').fill('Different1!');

    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible({ timeout: 5000 });
  });

  test('인증코드 만료 시 만료 메시지 표시', async ({ page }) => {
    await page.route('**/v1/auth/check-email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCheckEmail(true)) }),
    );
    // 1초 후 만료되도록 설정
    await page.route('**/v1/auth/send-verification', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '인증 코드가 발송되었습니다.',
          data: { message: '인증 코드가 발송되었습니다.', expiresInSeconds: 1 },
          timestamp: new Date().toISOString(),
        }),
      }),
    );

    await completeStep1(page);

    await page.getByPlaceholder('회사 이메일을 입력해주세요.').fill('test@example.com');
    await page.getByRole('button', { name: '인증요청' }).click();

    // 1초 후 타이머 만료 대기
    await expect(page.getByText('인증코드가 만료되었습니다')).toBeVisible({ timeout: 5000 });
  });
});
