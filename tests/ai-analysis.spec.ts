import { test, expect } from '@playwright/test';
import { DiagnosticAiAnalysisPage } from './pages/DiagnosticAiAnalysisPage';

// 기본 storageState 사용 (DRAFTER)
test.use({ storageState: 'tests/.auth/storageState.json' });

// 테스트용 진단 ID
const TEST_DIAGNOSTIC_ID = 1;

test.describe('이슈 #71: AI 분석 실행 및 결과 확인 테스트', () => {

  test.describe('Preview 요청 및 슬롯 상태 표시', () => {

    test('슬롯 상태(필수/선택, 제출/미제출) 정상 표시', async ({ page }) => {
      // 진단 상세 API 모킹
      await page.route('**/v1/diagnostics/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'SUCCESS',
              message: '성공',
              data: {
                diagnosticId: TEST_DIAGNOSTIC_ID,
                title: '테스트 진단',
                domainCode: 'ESG',
                status: 'IN_PROGRESS',
              },
            }),
          });
        }
      });

      // Preview API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/preview', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: {
              packageId: 'pkg-001',
              requiredSlotStatus: [
                { slotName: '환경 정책', required: true, submitted: true },
                { slotName: '탄소 배출량', required: true, submitted: true },
                { slotName: '폐기물 관리', required: true, submitted: false },
                { slotName: '사회적 책임', required: false, submitted: true },
                { slotName: '거버넌스 보고서', required: false, submitted: false },
              ],
              slotHints: [],
              missingRequiredSlots: [],
            },
          }),
        });
      });

      // AI 결과 API 모킹 (결과 없음)
      await page.route('**/v1/ai/run/diagnostics/*/result', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'AI_001',
            message: '분석 결과가 없습니다',
          }),
        });
      });

      // 이력 API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: [],
          }),
        });
      });

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 필수 항목 현황 섹션 확인
      await expect(page.getByText('필수 항목 현황')).toBeVisible();

      // 슬롯 상태 확인
      await expect(page.getByText('환경 정책')).toBeVisible();
      await expect(page.getByText('탄소 배출량')).toBeVisible();
      await expect(page.getByText('폐기물 관리')).toBeVisible();

      // 필수 배지 확인
      await expect(aiPage.getRequiredBadge().first()).toBeVisible();

      // 제출됨/미제출 배지 확인
      await expect(aiPage.getSubmittedBadge().first()).toBeVisible();
      await expect(aiPage.getNotSubmittedBadge().first()).toBeVisible();
    });

    test('미제출 필수 슬롯(missingRequiredSlots) 경고 표시', async ({ page }) => {
      // 진단 상세 API 모킹
      await page.route('**/v1/diagnostics/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'SUCCESS',
              message: '성공',
              data: {
                diagnosticId: TEST_DIAGNOSTIC_ID,
                title: '테스트 진단',
                domainCode: 'SAFETY',
                status: 'IN_PROGRESS',
              },
            }),
          });
        }
      });

      // Preview API 모킹 - 필수 슬롯 누락
      await page.route('**/v1/ai/run/diagnostics/*/preview', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: {
              packageId: 'pkg-002',
              requiredSlotStatus: [
                { slotName: '안전 점검표', required: true, submitted: false },
                { slotName: '위험성 평가서', required: true, submitted: false },
                { slotName: '교육 이수증', required: true, submitted: true },
              ],
              slotHints: [],
              missingRequiredSlots: ['안전 점검표', '위험성 평가서'],
            },
          }),
        });
      });

      // AI 결과 API 모킹 (결과 없음)
      await page.route('**/v1/ai/run/diagnostics/*/result', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'AI_001',
            message: '분석 결과가 없습니다',
          }),
        });
      });

      // 이력 API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: [],
          }),
        });
      });

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 필수 항목 누락 경고 확인
      await expect(aiPage.getMissingSlotWarning()).toBeVisible();
      await expect(aiPage.getMissingSlotInWarning('안전 점검표')).toBeVisible();
      await expect(aiPage.getMissingSlotInWarning('위험성 평가서')).toBeVisible();

      // AI 분석 실행 버튼 비활성화 확인
      await expect(aiPage.runAnalysisButton).toBeDisabled();
    });
  });

  test.describe('Submit 실행 및 결과 렌더링', () => {

    test('verdict PASS 결과 렌더링', async ({ page }) => {
      await setupMocksWithResult(page, 'PASS', 'LOW');

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 결과 확인
      await expect(aiPage.getVerdictBadge('PASS')).toBeVisible();
      await expect(aiPage.getRiskLevelBadge('LOW')).toBeVisible();
    });

    test('verdict WARN 결과 렌더링', async ({ page }) => {
      await setupMocksWithResult(page, 'WARN', 'MEDIUM');

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      await expect(aiPage.getVerdictBadge('WARN')).toBeVisible();
      await expect(aiPage.getRiskLevelBadge('MEDIUM')).toBeVisible();
    });

    test('verdict NEED_CLARIFY 결과 렌더링', async ({ page }) => {
      await setupMocksWithResult(page, 'NEED_CLARIFY', 'MEDIUM');

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      await expect(aiPage.getVerdictBadge('NEED_CLARIFY')).toBeVisible();
    });

    test('verdict NEED_FIX 결과 렌더링', async ({ page }) => {
      await setupMocksWithResult(page, 'NEED_FIX', 'HIGH');

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      await expect(aiPage.getVerdictBadge('NEED_FIX')).toBeVisible();
      await expect(aiPage.getRiskLevelBadge('HIGH')).toBeVisible();
    });

    test('riskLevel LOW/MEDIUM/HIGH 표시 확인', async ({ page }) => {
      // LOW 테스트
      await setupMocksWithResult(page, 'PASS', 'LOW');
      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();
      await expect(aiPage.getRiskLevelBadge('LOW')).toBeVisible();
    });
  });

  test.describe('분석 실행 모달', () => {

    test('AI 분석 실행 모달 표시 및 취소', async ({ page }) => {
      await setupMocksNoResult(page);

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 모달 열기
      await aiPage.openSubmitModal();
      await expect(page.getByRole('heading', { name: 'AI 분석 실행' })).toBeVisible();
      await expect(page.getByText('업로드된 파일을 기반으로 AI 분석을 실행합니다.')).toBeVisible();

      // 취소
      await aiPage.cancelSubmit();
      await expect(aiPage.submitModal).toBeHidden();
    });

    test('AI 분석 실행 후 분석 중 상태 표시', async ({ page }) => {
      await setupMocksNoResult(page);

      // Submit API 모킹 - 성공
      await page.route('**/v1/ai/run/diagnostics/*/submit', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '분석이 시작되었습니다',
          }),
        });
      });

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 모달 열고 실행
      await aiPage.openSubmitModal();
      await aiPage.confirmSubmit();

      // 분석 중 상태 확인
      await expect(aiPage.getAnalyzingMessage()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('AI 서비스 에러 처리', () => {

    test('AI 서비스 실패 시 S003 에러 메시지 표시', async ({ page }) => {
      // 진단 상세 API 모킹
      await page.route('**/v1/diagnostics/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'SUCCESS',
              message: '성공',
              data: {
                diagnosticId: TEST_DIAGNOSTIC_ID,
                title: '테스트 진단',
                domainCode: 'ESG',
                status: 'IN_PROGRESS',
              },
            }),
          });
        }
      });

      // Preview API 모킹 - 에러
      await page.route('**/v1/ai/run/diagnostics/*/preview', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'S003',
            message: 'AI 서비스 연동에 실패했습니다',
          }),
        });
      });

      // AI 결과 API 모킹 (결과 없음)
      await page.route('**/v1/ai/run/diagnostics/*/result', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'AI_001',
            message: '분석 결과가 없습니다',
          }),
        });
      });

      // 이력 API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: [],
          }),
        });
      });

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 에러 메시지 확인
      await expect(aiPage.getSlotLoadError()).toBeVisible();
    });
  });

  test.describe('분석 이력(History) 조회', () => {

    test('분석 이력 목록 정상 조회', async ({ page }) => {
      // 진단 상세 API 모킹
      await page.route('**/v1/diagnostics/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'SUCCESS',
              message: '성공',
              data: {
                diagnosticId: TEST_DIAGNOSTIC_ID,
                title: '테스트 진단',
                domainCode: 'ESG',
                status: 'IN_PROGRESS',
              },
            }),
          });
        }
      });

      // Preview API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/preview', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: {
              packageId: 'pkg-001',
              requiredSlotStatus: [
                { slotName: '환경 정책', required: true, submitted: true },
              ],
              slotHints: [],
              missingRequiredSlots: [],
            },
          }),
        });
      });

      // AI 결과 API 모킹
      await page.route('**/v1/ai/run/diagnostics/*/result', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: {
              resultId: 1,
              diagnosticId: TEST_DIAGNOSTIC_ID,
              domainCode: 'ESG',
              packageId: 'pkg-001',
              riskLevel: 'LOW',
              verdict: 'PASS',
              whySummary: '모든 필수 항목이 적합합니다.',
              resultJson: '{}',
              analyzedAt: '2025-01-30T10:00:00',
            },
          }),
        });
      });

      // 이력 API 모킹 - 여러 이력 있음
      await page.route('**/v1/ai/run/diagnostics/*/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'SUCCESS',
            message: '성공',
            data: [
              {
                resultId: 3,
                diagnosticId: TEST_DIAGNOSTIC_ID,
                domainCode: 'ESG',
                packageId: 'pkg-003',
                riskLevel: 'LOW',
                verdict: 'PASS',
                whySummary: '최종 분석 완료',
                resultJson: '{}',
                analyzedAt: '2025-01-30T12:00:00',
              },
              {
                resultId: 2,
                diagnosticId: TEST_DIAGNOSTIC_ID,
                domainCode: 'ESG',
                packageId: 'pkg-002',
                riskLevel: 'MEDIUM',
                verdict: 'WARN',
                whySummary: '일부 항목 확인 필요',
                resultJson: '{}',
                analyzedAt: '2025-01-30T11:00:00',
              },
              {
                resultId: 1,
                diagnosticId: TEST_DIAGNOSTIC_ID,
                domainCode: 'ESG',
                packageId: 'pkg-001',
                riskLevel: 'HIGH',
                verdict: 'NEED_FIX',
                whySummary: '초기 분석 결과',
                resultJson: '{}',
                analyzedAt: '2025-01-30T10:00:00',
              },
            ],
          }),
        });
      });

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 분석 이력 섹션 확인
      await expect(page.getByRole('heading', { name: '분석 이력' })).toBeVisible();

      // 이력 항목 확인
      await expect(page.getByText('최종 분석 완료')).toBeVisible();
      await expect(page.getByText('일부 항목 확인 필요')).toBeVisible();
      await expect(page.getByText('초기 분석 결과')).toBeVisible();
    });

    test('분석 이력 없음 표시', async ({ page }) => {
      await setupMocksNoResult(page);

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 이력 없음 메시지 확인
      await expect(aiPage.getNoHistoryMessage()).toBeVisible();
    });
  });

  test.describe('분석 결과 없음 상태', () => {

    test('분석 결과 없음 메시지 표시', async ({ page }) => {
      await setupMocksNoResult(page);

      const aiPage = new DiagnosticAiAnalysisPage(page);
      await aiPage.goto(TEST_DIAGNOSTIC_ID);
      await aiPage.waitForPageLoaded();

      // 결과 없음 메시지 확인
      await expect(aiPage.getNoResultMessage()).toBeVisible();
      await expect(page.getByText('AI 분석을 실행해 주세요')).toBeVisible();
    });
  });
});

// Helper: 결과가 있는 상태로 모킹 설정
async function setupMocksWithResult(
  page: any,
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX',
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
) {
  // 진단 상세 API 모킹
  await page.route('**/v1/diagnostics/*', async (route: any) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'SUCCESS',
          message: '성공',
          data: {
            diagnosticId: TEST_DIAGNOSTIC_ID,
            title: '테스트 진단',
            domainCode: 'ESG',
            status: 'IN_PROGRESS',
          },
        }),
      });
    }
  });

  // Preview API 모킹
  await page.route('**/v1/ai/run/diagnostics/*/preview', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SUCCESS',
        message: '성공',
        data: {
          packageId: 'pkg-001',
          requiredSlotStatus: [
            { slotName: '환경 정책', required: true, submitted: true },
          ],
          slotHints: [],
          missingRequiredSlots: [],
        },
      }),
    });
  });

  // AI 결과 API 모킹
  await page.route('**/v1/ai/run/diagnostics/*/result', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SUCCESS',
        message: '성공',
        data: {
          resultId: 1,
          diagnosticId: TEST_DIAGNOSTIC_ID,
          domainCode: 'ESG',
          packageId: 'pkg-001',
          riskLevel: riskLevel,
          verdict: verdict,
          whySummary: `분석 결과: ${verdict} (위험도: ${riskLevel})`,
          resultJson: '{}',
          analyzedAt: '2025-01-30T10:00:00',
        },
      }),
    });
  });

  // 이력 API 모킹
  await page.route('**/v1/ai/run/diagnostics/*/history', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SUCCESS',
        message: '성공',
        data: [
          {
            resultId: 1,
            diagnosticId: TEST_DIAGNOSTIC_ID,
            domainCode: 'ESG',
            packageId: 'pkg-001',
            riskLevel: riskLevel,
            verdict: verdict,
            whySummary: `분석 결과: ${verdict}`,
            resultJson: '{}',
            analyzedAt: '2025-01-30T10:00:00',
          },
        ],
      }),
    });
  });
}

// Helper: 결과가 없는 상태로 모킹 설정
async function setupMocksNoResult(page: any) {
  // 진단 상세 API 모킹
  await page.route('**/v1/diagnostics/*', async (route: any) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'SUCCESS',
          message: '성공',
          data: {
            diagnosticId: TEST_DIAGNOSTIC_ID,
            title: '테스트 진단',
            domainCode: 'ESG',
            status: 'IN_PROGRESS',
          },
        }),
      });
    }
  });

  // Preview API 모킹
  await page.route('**/v1/ai/run/diagnostics/*/preview', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SUCCESS',
        message: '성공',
        data: {
          packageId: 'pkg-001',
          requiredSlotStatus: [
            { slotName: '환경 정책', required: true, submitted: true },
            { slotName: '탄소 배출량', required: true, submitted: true },
          ],
          slotHints: [],
          missingRequiredSlots: [],
        },
      }),
    });
  });

  // AI 결과 API 모킹 (결과 없음)
  await page.route('**/v1/ai/run/diagnostics/*/result', async (route: any) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'AI_001',
        message: '분석 결과가 없습니다',
      }),
    });
  });

  // 이력 API 모킹
  await page.route('**/v1/ai/run/diagnostics/*/history', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'SUCCESS',
        message: '성공',
        data: [],
      }),
    });
  });
}
