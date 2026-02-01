import { type Page, type Locator, expect } from '@playwright/test';

export class DiagnosticAiAnalysisPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loadingSpinner: Locator;
  readonly backButton: Locator;
  readonly runAnalysisButton: Locator;
  readonly slotStatusSection: Locator;
  readonly analysisResultSection: Locator;
  readonly historySection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'AI 분석' });
    this.loadingSpinner = page.locator('.animate-spin');
    this.backButton = page.getByText('기안 상세로 돌아가기');
    this.runAnalysisButton = page.getByRole('button', { name: /AI 분석 실행|분석 중/ });
    this.slotStatusSection = page.getByRole('heading', { name: '필수 항목 현황' }).locator('..');
    this.analysisResultSection = page.getByRole('heading', { name: '분석 결과' }).locator('..');
    this.historySection = page.getByRole('heading', { name: '분석 이력' }).locator('..');
  }

  async goto(diagnosticId: number) {
    await this.page.goto(`/diagnostics/${diagnosticId}/ai-analysis`);
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  async waitForPageLoaded() {
    await expect(this.loadingSpinner.first()).toBeHidden({ timeout: 15000 });
  }

  // 슬롯 현황 관련
  getSlotItem(slotName: string): Locator {
    return this.page.locator('div').filter({ hasText: slotName }).filter({ has: this.page.locator('span') });
  }

  getRequiredBadge(): Locator {
    return this.page.locator('span').filter({ hasText: '필수' });
  }

  getSubmittedBadge(): Locator {
    return this.page.locator('span').filter({ hasText: '제출됨' });
  }

  getNotSubmittedBadge(): Locator {
    return this.page.locator('span').filter({ hasText: '미제출' });
  }

  getMissingSlotWarning(): Locator {
    return this.page.getByText('필수 항목 누락');
  }

  getMissingSlotList(): Locator {
    return this.page.locator('.bg-red-50');
  }

  // 분석 결과 관련 - 분석 결과 섹션 내에서만 찾기
  getVerdictBadge(verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX'): Locator {
    const labels = {
      PASS: '적합',
      WARN: '경고',
      NEED_CLARIFY: '확인 필요',
      NEED_FIX: '수정 필요',
    };
    // 분석 결과 섹션의 첫 번째 큰 배지만 선택 (font-title-medium 클래스 사용)
    return this.page.locator('.font-title-medium').filter({ hasText: labels[verdict] }).first();
  }

  getRiskLevelBadge(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): Locator {
    const labels = {
      LOW: '위험도: 낮음',
      MEDIUM: '위험도: 중간',
      HIGH: '위험도: 높음',
    };
    return this.page.locator('.font-title-xsmall').filter({ hasText: labels[riskLevel] }).first();
  }

  getAnalysisSummary(): Locator {
    return this.page.getByText('분석 요약').locator('..').locator('p').last();
  }

  getNoResultMessage(): Locator {
    return this.page.getByText('아직 분석 결과가 없습니다');
  }

  getAnalyzingMessage(): Locator {
    return this.page.getByText('AI가 문서를 분석 중입니다...');
  }

  // 분석 이력 관련
  getHistoryItem(index: number): Locator {
    return this.historySection.locator('.space-y-\\[16px\\] > div').nth(index);
  }

  getNoHistoryMessage(): Locator {
    return this.page.getByText('분석 이력이 없습니다');
  }

  // 모달 관련
  get submitModal(): Locator {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByRole('heading', { name: 'AI 분석 실행' }) });
  }

  get submitModalConfirmButton(): Locator {
    return this.submitModal.getByRole('button', { name: '분석 실행' });
  }

  get submitModalCancelButton(): Locator {
    return this.submitModal.getByRole('button', { name: '취소' });
  }

  async openSubmitModal() {
    await this.runAnalysisButton.click();
    await expect(this.submitModal).toBeVisible();
  }

  async confirmSubmit() {
    await this.submitModalConfirmButton.click();
  }

  async cancelSubmit() {
    await this.submitModalCancelButton.click();
    await expect(this.submitModal).toBeHidden();
  }

  // 에러 관련
  getErrorMessage(): Locator {
    return this.page.getByText('AI 서비스 연동에 실패했습니다');
  }

  getSlotLoadError(): Locator {
    return this.page.getByText('슬롯 정보를 불러올 수 없습니다');
  }

  // 누락 슬롯 경고 내 슬롯 이름 확인
  getMissingSlotInWarning(slotName: string): Locator {
    return this.page.locator('.bg-red-50 li').filter({ hasText: slotName });
  }
}
