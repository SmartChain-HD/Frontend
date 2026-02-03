import { type Page, type Locator, expect } from '@playwright/test';

export class PermissionManagementPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;
  readonly refreshButton: Locator;
  readonly searchInput: Locator;
  readonly statusDropdown: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: '권한 관리' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.emptyMessage = page.getByText('권한 요청 내역이 없습니다.');
    this.errorMessage = page.getByText('요청 목록을 불러오는데 실패했습니다.');
    this.refreshButton = page.getByRole('button', { name: '새로고침' });
    this.searchInput = page.getByPlaceholder('이름 또는 회사명으로 검색');
    this.statusDropdown = page.locator('button').filter({ hasText: /전체|승인 대기|승인 완료|반려/ }).first();
    this.resetButton = page.getByRole('button', { name: '초기화' });
  }

  async goto() {
    await this.page.goto('/dashboard/permission');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
    await this.waitForListLoaded();
  }

  async waitForListLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  getStatusOption(label: string): Locator {
    return this.page.locator('button').filter({ hasText: label }).last();
  }

  async selectStatusFilter(status: '전체' | '승인 대기' | '승인 완료' | '반려') {
    await this.statusDropdown.click();
    await this.getStatusOption(status).click();
    await this.waitForListLoaded();
  }

  async getRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') });
    return rows.count();
  }

  getRowByIndex(index: number): Locator {
    return this.page.locator('tbody tr').filter({ hasNot: this.page.locator('td[colspan]') }).nth(index);
  }

  getRowByUserName(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name });
  }

  async clickActionButton(row: Locator) {
    const actionButton = row.locator('button').filter({ hasText: /처리|보기/ });
    await actionButton.click();
  }

  async clickFirstPendingAction() {
    const pendingRow = this.page.locator('tbody tr').filter({ hasText: '승인 대기' }).first();
    await this.clickActionButton(pendingRow);
  }

  async clickFirstProcessedAction() {
    const processedRow = this.page.locator('tbody tr').filter({ hasNot: this.page.getByText('승인 대기') }).first();
    await this.clickActionButton(processedRow);
  }

  // Modal interactions
  get modal() {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByText('권한 요청 상세') });
  }

  get approveOption() {
    return this.page.locator('button').filter({ has: this.page.locator('text=승인') }).first();
  }

  get rejectOption() {
    return this.page.locator('button').filter({ has: this.page.locator('text=반려') }).first();
  }

  get rejectReasonInput() {
    return this.page.getByPlaceholder('반려 사유를 입력해주세요');
  }

  get submitApproveButton() {
    return this.page.getByRole('button', { name: '승인하기' });
  }

  get submitRejectButton() {
    return this.page.getByRole('button', { name: '반려하기' });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: '확인' });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: '취소' });
  }

  get closeModalButton() {
    return this.modal.locator('button').first();
  }

  async approveRequest() {
    await this.approveOption.click();
    await this.submitApproveButton.click();
    await this.confirmButton.click();
  }

  async rejectRequest(reason?: string) {
    await this.rejectOption.click();
    if (reason) {
      await this.rejectReasonInput.fill(reason);
    }
    await this.submitRejectButton.click();
    await this.confirmButton.click();
  }

  async closeModal() {
    await this.closeModalButton.click();
  }

  getStatusBadge(row: Locator): Locator {
    return row.locator('span').filter({ hasText: /승인 대기|승인 완료|반려/ });
  }
}
