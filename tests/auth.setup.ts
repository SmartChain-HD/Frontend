import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_STATE = path.join(__dirname, '.auth/storageState.json');

setup('authenticate and save storageState', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('이메일을 입력해주세요.').fill('drafter1@techpartner.co.kr');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('Test1234!');
  await page.getByRole('button', { name: '로그인', exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.context().storageState({ path: STORAGE_STATE });
});
