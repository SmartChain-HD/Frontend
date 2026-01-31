import { type Page, type Locator, expect } from '@playwright/test';

export class ApprovalDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;

  // 모달
  readonly modalTitle: Locator;
  readonly commentInput: Locator;
  readonly rejectReasonInput: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmApproveButton: Locator;
  readonly modalConfirmRejectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: '목록으로' });
    this.approveButton = page.getByRole('button', { name: '승인', exact: true });
    this.rejectButton = page.getByRole('button', { name: '반려', exact: true });
    this.loadingSpinner = page.locator('.animate-spin');
    this.errorMessage = page.getByText('결재 정보를 불러오는 데 실패했습니다.');

    // 모달 내부 요소
    this.modalTitle = page.locator('.fixed h2');
    this.commentInput = page.getByPlaceholder('코멘트를 입력하세요');
    this.rejectReasonInput = page.getByPlaceholder('반려 사유를 입력하세요');
    this.modalCancelButton = page.locator('.fixed').getByRole('button', { name: '취소' });
    this.modalConfirmApproveButton = page.locator('.fixed').getByRole('button', { name: '승인' });
    this.modalConfirmRejectButton = page.locator('.fixed').getByRole('button', { name: '반려' });
  }

  async goto(id: number) {
    await this.page.goto(`/approvals/${id}`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  /** 상태 배지 텍스트 가져오기 */
  getStatusBadge(): Locator {
    return this.page.locator('span.rounded-full').first();
  }

  /** 승인 모달 열고 처리 */
  async approveWithComment(comment?: string) {
    await this.approveButton.click();
    await expect(this.modalTitle).toHaveText('결재 승인');
    if (comment) {
      await this.commentInput.fill(comment);
    }
    await this.modalConfirmApproveButton.click();
  }

  /** 반려 모달 열고 처리 */
  async rejectWithReason(reason: string, comment?: string) {
    await this.rejectButton.click();
    await expect(this.modalTitle).toHaveText('결재 반려');
    if (comment) {
      await this.commentInput.fill(comment);
    }
    await this.rejectReasonInput.fill(reason);
    await this.modalConfirmRejectButton.click();
  }
}
