import { type Page, type Locator, expect } from '@playwright/test';

export class ReviewDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly approveButton: Locator;
  readonly revisionRequiredButton: Locator;
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;
  readonly reportButton: Locator;

  // 모달
  readonly modalTitle: Locator;
  readonly scoreInput: Locator;
  readonly commentInput: Locator;
  readonly categoryEInput: Locator;
  readonly categorySInput: Locator;
  readonly categoryGInput: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmApproveButton: Locator;
  readonly modalConfirmRevisionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: '목록으로' });
    this.approveButton = page.getByRole('button', { name: '승인', exact: true });
    this.revisionRequiredButton = page.getByRole('button', { name: '보완요청', exact: true });
    this.loadingSpinner = page.locator('.animate-spin');
    this.errorMessage = page.getByText('심사 정보를 불러오는 데 실패했습니다.');
    this.reportButton = page.getByRole('button', { name: '리포트 생성' });

    // 모달 내부 요소
    this.modalTitle = page.locator('.fixed h2');
    this.scoreInput = page.getByPlaceholder('0 ~ 100');
    this.commentInput = page.getByPlaceholder('코멘트를 입력하세요');
    this.categoryEInput = page.getByPlaceholder('환경 관련 의견');
    this.categorySInput = page.getByPlaceholder('사회 관련 의견');
    this.categoryGInput = page.getByPlaceholder('지배구조 관련 의견');
    this.modalCancelButton = page.locator('.fixed').getByRole('button', { name: '취소' });
    this.modalConfirmApproveButton = page.locator('.fixed').getByRole('button', { name: '승인' });
    this.modalConfirmRevisionButton = page.locator('.fixed').getByRole('button', { name: '보완요청' });
  }

  async goto(id: number) {
    await this.page.goto(`/reviews/${id}`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 15000 });
  }

  /** 상태 배지 텍스트 가져오기 */
  getStatusBadge(): Locator {
    return this.page.locator('span.rounded-full').first();
  }

  /** 제목 가져오기 */
  getTitle(): Locator {
    return this.page.locator('h1');
  }

  /** 기본 정보 영역 */
  getInfoSection(): Locator {
    return this.page.locator('.bg-white.rounded-\\[12px\\]').first();
  }

  /** 승인 모달 열고 처리 */
  async approveWithDetails(options?: { score?: number; comment?: string }) {
    await this.approveButton.click();
    await expect(this.modalTitle).toHaveText('심사 승인');

    if (options?.score !== undefined) {
      await this.scoreInput.fill(String(options.score));
    }
    if (options?.comment) {
      await this.commentInput.fill(options.comment);
    }

    await this.modalConfirmApproveButton.click();
  }

  /** 보완요청 모달 열고 처리 */
  async requestRevisionWithDetails(options?: { score?: number; comment?: string }) {
    await this.revisionRequiredButton.click();
    await expect(this.modalTitle).toHaveText('보완 요청');

    if (options?.score !== undefined) {
      await this.scoreInput.fill(String(options.score));
    }
    if (options?.comment) {
      await this.commentInput.fill(options.comment);
    }

    await this.modalConfirmRevisionButton.click();
  }
}
