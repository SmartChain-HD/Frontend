import { type Page, type Locator, expect } from '@playwright/test';

export class ActivityLogPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly actionTypeSelect: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly exportButton: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;
  readonly totalCountText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '활동 로그' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.fromDateInput = page.locator('input[type="date"]').first();
    this.toDateInput = page.locator('input[type="date"]').last();
    this.actionTypeSelect = page.locator('select').filter({ hasText: '전체 액션' });
    this.searchButton = page.getByRole('button', { name: '검색' });
    this.resetButton = page.getByRole('button', { name: '초기화' });
    this.exportButton = page.getByRole('button', { name: /내보내기/ });
    this.emptyMessage = page.getByText('활동 로그가 없습니다.');
    this.errorMessage = page.getByText('로그를 불러오는 데 실패했습니다.');
    this.totalCountText = page.locator('p').filter({ hasText: /총 \d+건/ });
  }

  async goto() {
    await this.page.goto('/management/activity-logs');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
    await this.waitForListLoaded();
  }

  async waitForListLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  async setDateRange(fromDate: string, toDate: string) {
    await this.fromDateInput.fill(fromDate);
    await this.toDateInput.fill(toDate);
  }

  async selectActionType(actionType: string) {
    const select = this.page.locator('select').first();
    await select.selectOption(actionType);
  }

  async applyFilter() {
    await this.searchButton.click();
    await this.waitForListLoaded();
  }

  async resetFilter() {
    await this.resetButton.click();
    await this.waitForListLoaded();
  }

  async getRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') });
    return rows.count();
  }

  getRowByIndex(index: number): Locator {
    return this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') }).nth(index);
  }

  getActionTypeBadge(row: Locator): Locator {
    return row.locator('span').filter({ hasText: /로그인|로그아웃|생성|수정|삭제|승인|반려|제출|다운로드|내보내기/ });
  }

  // Pagination
  get prevPageButton(): Locator {
    return this.page.getByRole('button', { name: '이전' });
  }

  get nextPageButton(): Locator {
    return this.page.getByRole('button', { name: '다음' });
  }

  getPageInfo(): Locator {
    return this.page.locator('span').filter({ hasText: /\d+ \/ \d+/ });
  }

  async goToNextPage() {
    if (await this.nextPageButton.isEnabled()) {
      await this.nextPageButton.click();
      await this.waitForListLoaded();
    }
  }

  async goToPrevPage() {
    if (await this.prevPageButton.isEnabled()) {
      await this.prevPageButton.click();
      await this.waitForListLoaded();
    }
  }

  // Export Modal
  async openExportModal() {
    await this.exportButton.click();
    await expect(this.page.getByRole('heading', { name: '활동 로그 내보내기' })).toBeVisible();
  }

  get exportModal(): Locator {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByRole('heading', { name: '활동 로그 내보내기' }) });
  }

  get excelRadio(): Locator {
    return this.page.locator('input[type="radio"][value="EXCEL"]');
  }

  get csvRadio(): Locator {
    return this.page.locator('input[type="radio"][value="CSV"]');
  }

  get submitExportButton(): Locator {
    return this.exportModal.getByRole('button', { name: '내보내기' });
  }

  get cancelExportButton(): Locator {
    return this.exportModal.getByRole('button', { name: '취소' });
  }

  async exportAsExcel() {
    await this.openExportModal();
    await this.excelRadio.check();
    await this.submitExportButton.click();
  }

  async exportAsCsv() {
    await this.openExportModal();
    await this.csvRadio.check();
    await this.submitExportButton.click();
  }
}
