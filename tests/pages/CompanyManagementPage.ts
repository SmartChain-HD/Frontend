import { type Page, type Locator, expect } from '@playwright/test';

export class CompanyManagementPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly typeFilterSelect: Locator;
  readonly registerButton: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '회사 관리' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.searchInput = page.getByPlaceholder('회사명으로 검색');
    this.searchButton = page.getByRole('button', { name: '검색' });
    this.typeFilterSelect = page.locator('select').filter({ hasText: '전체 유형' });
    this.registerButton = page.getByRole('button', { name: '회사 등록' });
    this.emptyMessage = page.getByText('등록된 회사가 없습니다.');
    this.errorMessage = page.getByText('데이터를 불러오는 중 오류가 발생했습니다.');
  }

  async goto() {
    await this.page.goto('/management/companies');
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

  async selectTypeFilter(type: string) {
    const select = this.page.locator('select').first();
    await select.selectOption(type);
    await this.waitForListLoaded();
  }

  async getRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') });
    return rows.count();
  }

  getRowByIndex(index: number): Locator {
    return this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') }).nth(index);
  }

  getRowByCompanyName(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name });
  }

  getCompanyTypeBadge(row: Locator): Locator {
    return row.locator('span').filter({ hasText: /공급업체|협력업체/ });
  }

  // Pagination
  getPageInfo(): Locator {
    return this.page.locator('span').filter({ hasText: /\d+ \/ \d+/ });
  }

  async goToNextPage() {
    const nextBtn = this.page.locator('button svg.lucide-chevron-right').locator('..');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await this.waitForListLoaded();
    }
  }

  async goToPrevPage() {
    const prevBtn = this.page.locator('button svg.lucide-chevron-left').locator('..');
    if (await prevBtn.isEnabled()) {
      await prevBtn.click();
      await this.waitForListLoaded();
    }
  }

  // Register Modal
  async openRegisterModal() {
    await this.registerButton.click();
    await expect(this.page.getByRole('heading', { name: '회사 등록' })).toBeVisible();
  }

  get registerModal(): Locator {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByRole('heading', { name: '회사 등록' }) });
  }

  get companyNameInput(): Locator {
    return this.page.getByPlaceholder('회사명을 입력해주세요');
  }

  get supplierTypeButton(): Locator {
    return this.page.getByRole('button', { name: '공급업체' });
  }

  get contractorTypeButton(): Locator {
    return this.page.getByRole('button', { name: '협력업체' });
  }

  get businessNumberInput(): Locator {
    return this.page.getByPlaceholder('000-00-00000');
  }

  get addressInput(): Locator {
    return this.page.getByPlaceholder('회사 주소를 입력해주세요');
  }

  get contactEmailInput(): Locator {
    return this.page.getByPlaceholder('contact@company.com');
  }

  get contactPhoneInput(): Locator {
    return this.page.getByPlaceholder('02-0000-0000');
  }

  get submitRegisterButton(): Locator {
    return this.page.getByRole('button', { name: '등록하기' });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: '취소' });
  }

  async registerCompany(companyName: string, companyType: 'SUPPLIER' | 'CONTRACTOR' = 'SUPPLIER') {
    await this.openRegisterModal();
    await this.companyNameInput.fill(companyName);
    if (companyType === 'CONTRACTOR') {
      await this.contractorTypeButton.click();
    }
    await this.submitRegisterButton.click();
  }
}
