import { type Page, type Locator, expect } from '@playwright/test';

export class DiagnosticCreatePage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly campaignSelect: Locator;
  readonly domainSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder('진단 제목을 입력하세요');
    // 캠페인 select는 "캠페인을 선택하세요" 옵션을 가진 select
    this.campaignSelect = page.locator('select').filter({ has: page.locator('option:text("캠페인을 선택하세요")') });
    // 도메인 select는 "도메인을 선택하세요" 옵션을 가진 select
    this.domainSelect = page.locator('select').filter({ has: page.locator('option:text("도메인을 선택하세요")') });
    this.startDateInput = page.locator('input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"]').last();
    this.submitButton = page.getByRole('button', { name: '진단 생성' });
    this.cancelButton = page.getByRole('button', { name: '취소' });
    this.backButton = page.getByRole('button', { name: '목록으로' });
    this.pageTitle = page.getByRole('heading', { name: '새 진단 생성' });
  }

  async goto() {
    await this.page.goto('/diagnostics/new');
  }

  async waitForCampaignsLoaded() {
    // 캠페인 목록이 로드될 때까지 대기 (옵션이 2개 이상이면 로드됨)
    await expect(this.campaignSelect.locator('option')).toHaveCount(5, { timeout: 10000 });
  }

  async fillForm(data: {
    title: string;
    campaignIndex?: number;
    domain: 'ESG' | 'SAFETY' | 'COMPLIANCE';
    startDate: string;
    endDate: string;
  }) {
    await this.titleInput.fill(data.title);

    // 캠페인 로드 대기 후 선택
    await this.waitForCampaignsLoaded();
    const optionIndex = data.campaignIndex ?? 1;
    await this.campaignSelect.selectOption({ index: optionIndex });

    await this.domainSelect.selectOption(data.domain);
    await this.startDateInput.fill(data.startDate);
    await this.endDateInput.fill(data.endDate);
  }

  async submit() {
    await this.submitButton.click();
  }

  async getValidationError(field: 'title' | 'domain' | 'startDate' | 'endDate'): Promise<string | null> {
    const errorLocators: Record<string, Locator> = {
      title: this.titleInput.locator('..').locator('p.text-red-500'),
      domain: this.domainSelect.locator('..').locator('p.text-red-500'),
      startDate: this.startDateInput.locator('..').locator('p.text-red-500'),
      endDate: this.endDateInput.locator('..').locator('p.text-red-500'),
    };

    const errorElement = errorLocators[field];
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async expectValidationError(message: string) {
    await expect(this.page.locator('p.text-red-500').filter({ hasText: message }).first()).toBeVisible();
  }
}
