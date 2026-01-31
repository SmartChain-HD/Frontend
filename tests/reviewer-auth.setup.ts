import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REVIEWER_STORAGE_STATE = path.join(__dirname, '.auth/reviewerStorageState.json');

setup('authenticate as REVIEWER and save storageState', async ({ page }) => {
  await page.goto('/login');

  // "수신자(원청) 로그인" 버튼 클릭하여 REVIEWER 역할로 로그인
  await page.getByRole('button', { name: '수신자(원청) 로그인' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.context().storageState({ path: REVIEWER_STORAGE_STATE });
});
