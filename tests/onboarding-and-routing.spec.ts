import { test, expect } from '@playwright/test';

// 미인증 상태로 테스트
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('이슈 #68 - 온보딩 페이지 및 미인증 라우팅 테스트', () => {
  test('온보딩 페이지(/) 정상 렌더링 확인', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'SmartChain', exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '시작하기' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '더 알아보기' }).first()).toBeVisible();
  });

  test('미인증 상태에서 /dashboard 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('미인증 상태에서 /diagnostics 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/diagnostics');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('미인증 상태에서 /approvals 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/approvals');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('미인증 상태에서 /reviews 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/reviews');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('미인증 상태에서 /management/users 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/management/users');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('온보딩 페이지에서 시작하기 클릭 시 /login으로 이동', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '시작하기' }).first().click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
