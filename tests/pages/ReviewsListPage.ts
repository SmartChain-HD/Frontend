import { type Page, type Locator, expect } from '@playwright/test';

export class ReviewsListPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '심사 관리' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.emptyMessage = page.getByText('심사 내역이 없습니다.');
    this.errorMessage = page.getByText('심사 목록을 불러오는 데 실패했습니다.');
  }

  async goto() {
    await this.page.goto('/reviews');
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
    // 체크박스가 아닌 제목 셀 클릭
    const titleCell = firstRow.locator('td').nth(1);
    await titleCell.click();
  }

  /** 특정 상태의 행 중 첫 번째 클릭 */
  async clickFirstRowWithStatus(status: string) {
    const row = this.page.locator('tbody tr').filter({ has: this.page.getByText(status, { exact: true }) }).first();
    const titleCell = row.locator('td').nth(1);
    await titleCell.click();
  }
}
