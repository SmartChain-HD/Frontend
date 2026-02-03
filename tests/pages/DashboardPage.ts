import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly statsSection: Locator;
  readonly notificationFeed: Locator;

  // Navigation (sidebar)
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '대시보드' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.statsSection = page.locator('.bg-white.rounded-\\[20px\\]').first();
    this.notificationFeed = page.getByText('실시간 알림 피드');

    // Sidebar navigation
    this.sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
  }

  getSidebarLink(name: string): Locator {
    // 사이드바 내 텍스트로 네비게이션 요소 찾기
    return this.page.locator('a, button, [role="button"]').filter({ hasText: name }).first();
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  async navigateToESG() {
    await this.page.getByText('ESG', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/\/dashboard\/esg/, { timeout: 10000 });
  }

  async navigateToSafety() {
    await this.page.getByText('안전보건', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/\/dashboard\/safety/, { timeout: 10000 });
  }

  async navigateToCompliance() {
    await this.page.getByText('컴플라이언스', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/\/dashboard\/compliance/, { timeout: 10000 });
  }

  async navigateToHome() {
    await this.page.getByText('홈', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  }

  getPageHeading(): Locator {
    return this.page.locator('h1').first();
  }

  getTable(): Locator {
    return this.page.locator('table');
  }
}
