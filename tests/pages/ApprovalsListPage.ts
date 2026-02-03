import { type Page, type Locator, expect } from '@playwright/test';

export class ApprovalsListPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '결재 관리' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.emptyMessage = page.getByText('결재 내역이 없습니다.');
    this.errorMessage = page.getByText('결재 목록을 불러오는 데 실패했습니다.');
  }

  async goto() {
    await this.page.goto('/approvals');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
    await this.waitForListLoaded();
  }

  async waitForListLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  getStatusTab(label: string): Locator {
    return this.page.getByRole('button', { name: label, exact: true });
  }

  /** 데이터 행만 카운트 (loading/empty/error 행 제외) */
  async getRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') });
    return rows.count();
  }

  /** 첫 번째 데이터 행 클릭 → 상세 페이지 이동 */
  async clickFirstRow() {
    const firstRow = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') }).first();
    await firstRow.click();
  }

  /** WAITING 상태 행 중 첫 번째 클릭 */
  async clickFirstWaitingRow() {
    const waitingRow = this.page.locator('tbody tr').filter({ has: this.page.getByText('대기') }).first();
    await waitingRow.click();
  }
}
