import { type Page, type Locator, expect } from '@playwright/test';

export class UserManagementPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly roleFilterSelect: Locator;
  readonly statusFilterSelect: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '사용자 관리' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.searchInput = page.getByPlaceholder('이름 또는 이메일로 검색');
    this.searchButton = page.getByRole('button', { name: '검색' });
    this.roleFilterSelect = page.locator('select').filter({ hasText: '전체 역할' });
    this.statusFilterSelect = page.locator('select').filter({ hasText: '전체 상태' });
    this.emptyMessage = page.getByText('등록된 사용자가 없습니다.');
    this.errorMessage = page.getByText('데이터를 불러오는 중 오류가 발생했습니다.');
  }

  async goto() {
    await this.page.goto('/management/users');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
    await this.waitForListLoaded();
  }

  async waitForListLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForListLoaded();
  }

  async selectRoleFilter(role: string) {
    const select = this.page.locator('select').first();
    await select.selectOption(role);
    await this.waitForListLoaded();
  }

  async selectStatusFilter(status: string) {
    const select = this.page.locator('select').nth(1);
    await select.selectOption(status);
    await this.waitForListLoaded();
  }

  async getRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') });
    return rows.count();
  }

  getRowByIndex(index: number): Locator {
    return this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') }).nth(index);
  }

  getRowByName(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name });
  }

  getStatusBadge(row: Locator): Locator {
    return row.locator('span').filter({ hasText: /활성|비활성/ });
  }

  // Pagination
  get prevPageButton(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: '' }).first();
  }

  get nextPageButton(): Locator {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: '' }).last();
  }

  getPageInfo(): Locator {
    return this.page.locator('span').filter({ hasText: /\d+ \/ \d+/ });
  }

  async goToNextPage() {
    const nextBtn = this.page.locator('button').filter({ has: this.page.locator('[class*="ChevronRight"]') }).last();
    await nextBtn.click();
    await this.waitForListLoaded();
  }

  async goToPrevPage() {
    const prevBtn = this.page.locator('button').filter({ has: this.page.locator('[class*="ChevronLeft"]') }).first();
    await prevBtn.click();
    await this.waitForListLoaded();
  }

  // Role change
  async openRoleDropdown(row: Locator) {
    const roleButton = row.locator('button').filter({ hasText: /게스트|기안자|결재자|수신자/ });
    await roleButton.click();
  }

  async selectRole(roleName: string) {
    await this.page.locator('button').filter({ hasText: roleName }).last().click();
  }

  // Modals
  get confirmModal(): Locator {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByText('역할을 변경하시겠습니까?') });
  }

  get statusModal(): Locator {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByText(/활성화하시겠습니까|비활성화하시겠습니까/) });
  }

  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: '확인' });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: '취소' });
  }
}
