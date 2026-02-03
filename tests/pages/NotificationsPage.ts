import { type Page, type Locator, expect } from '@playwright/test';

export class NotificationsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;
  readonly markAllReadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '알림' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.emptyMessage = page.getByText('알림이 없습니다.');
    this.errorMessage = page.getByText('알림을 불러오는 데 실패했습니다.');
    this.markAllReadButton = page.getByRole('button', { name: '모두 읽음' });
  }

  async goto() {
    await this.page.goto('/notifications');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  getFilterTab(label: string): Locator {
    return this.page.getByRole('button', { name: label, exact: true });
  }

  getNotificationCards(): Locator {
    return this.page.locator('[class*="rounded-\\[12px\\]"][class*="border"]').filter({
      has: this.page.locator('[class*="font-title-small"]'),
    });
  }

  async getNotificationCount(): Promise<number> {
    const cards = this.getNotificationCards();
    return cards.count();
  }

  async clickFirstNotification() {
    const firstCard = this.getNotificationCards().first();
    await firstCard.click();
  }
}
