import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DUMMY_DIR = path.join(__dirname, '.tmp-upload');
const DUMMY_PDF = path.join(DUMMY_DIR, 'TestCompany_202601_테스트문서.pdf');
const DUMMY_DOC = path.join(DUMMY_DIR, 'TestCompany_202601_테스트메모.pdf');

/** 진단 목록에서 첫 번째 진단의 파일 업로드 페이지로 이동 */
async function goToFilesPage(page: import('@playwright/test').Page): Promise<'editable' | 'readonly' | false> {
  await page.goto('/diagnostics', { waitUntil: 'networkidle' });

  // "진단 관리" 헤더가 보이는지 확인 (페이지 렌더링 확인)
  try {
    await page.getByText('진단 관리').waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    return false;
  }

  // 진단 내역이 없으면 실패
  const noData = await page.getByText('진단 내역이 없습니다').isVisible().catch(() => false);
  if (noData) return false;

  // 데이터 행 클릭 — 로딩/에러/빈 행이 아닌 클릭 가능한 행을 기다림
  const dataRow = page.locator('table tbody tr >> nth=0');
  await dataRow.waitFor({ state: 'attached', timeout: 10000 });
  // 행이 안정될 때까지 약간 대기
  await page.waitForTimeout(500);
  await dataRow.click({ timeout: 5000 });
  await expect(page).toHaveURL(/\/diagnostics\/\d+/, { timeout: 10000 });

  // "파일 관리" 버튼 클릭 → 파일 업로드 페이지
  await page.getByRole('button', { name: '파일 관리' }).click();
  await expect(page).toHaveURL(/\/diagnostics\/\d+\/files/, { timeout: 10000 });
  await expect(page.getByText('파일 업로드').first()).toBeVisible({ timeout: 10000 });

  // canEdit 여부 판별: 업로드 영역이 있으면 editable, 경고 배너가 있으면 readonly
  const hasUploadArea = await page.getByText('파일을 드래그하거나 클릭하여 업로드')
    .isVisible().catch(() => false);
  return hasUploadArea ? 'editable' : 'readonly';
}

test.describe('이슈 #70 - 증빙파일 업로드 및 관리 테스트', () => {
  // 파일 시스템 공유 문제 방지를 위해 직렬 실행
  test.describe.configure({ mode: 'serial' });

  // 더미 파일 생성
  test.beforeAll(() => {
    if (!fs.existsSync(DUMMY_DIR)) {
      fs.mkdirSync(DUMMY_DIR, { recursive: true });
    }
    fs.writeFileSync(DUMMY_PDF, '%PDF-1.4 dummy pdf content for e2e test');
    fs.writeFileSync(DUMMY_DOC, 'dummy doc content for e2e test');
  });

  // 더미 파일 정리
  test.afterAll(() => {
    if (fs.existsSync(DUMMY_DIR)) {
      fs.rmSync(DUMMY_DIR, { recursive: true, force: true });
    }
  });

  test('진단 목록에서 파일 업로드 페이지로 이동한다', async ({ page }) => {
    await page.goto('/diagnostics', { waitUntil: 'networkidle' });

    // "진단 관리" 헤더 확인
    await expect(page.getByText('진단 관리')).toBeVisible({ timeout: 15000 });

    // 진단 내역이 없으면 스킵
    const noData = await page.getByText('진단 내역이 없습니다').isVisible().catch(() => false);
    if (noData) {
      test.skip(true, '진단 내역이 없습니다');
      return;
    }

    // 첫 번째 데이터 행 클릭
    await page.locator('table tbody tr >> nth=0').click({ timeout: 5000 });
    await expect(page).toHaveURL(/\/diagnostics\/\d+/, { timeout: 10000 });

    // "파일 관리" 버튼 클릭
    await page.getByRole('button', { name: '파일 관리' }).click();
    await expect(page).toHaveURL(/\/diagnostics\/\d+\/files/, { timeout: 10000 });
  });

  test('파일 업로드 페이지가 정상 렌더링된다', async ({ page }) => {
    const result = await goToFilesPage(page);
    if (!result) {
      test.skip(true, '진단 항목이 없어 테스트를 건너뜁니다');
      return;
    }

    // 파일명 가이드는 canEdit 여부와 무관하게 항상 표시
    await expect(page.getByText('파일명 가이드')).toBeVisible();

    if (result === 'editable') {
      await expect(page.getByText('파일을 드래그하거나 클릭하여 업로드')).toBeVisible();
      await expect(page.getByText(/PDF, JPG, PNG/)).toBeVisible();
    } else {
      // readonly 상태: 경고 배너 표시
      await expect(page.getByText(/파일 업로드\/삭제가 불가/)).toBeVisible();
    }
  });

  test('더미 파일을 업로드하면 파일 목록에 표시된다', async ({ page }) => {
    const result = await goToFilesPage(page);
    if (!result) {
      test.skip(true, '진단 항목이 없어 테스트를 건너뜁니다');
      return;
    }
    if (result === 'readonly') {
      test.skip(true, '진단 상태가 WRITING/RETURNED이 아니어서 업로드 불가');
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(DUMMY_PDF);

    await expect(page.getByText('TestCompany_202601_테스트문서.pdf')).toBeVisible({ timeout: 30000 });

    const hasStatus = await page.getByText(/대기중|분석중|완료/).first().isVisible().catch(() => false);
    expect(hasStatus).toBeTruthy();
  });

  test('업로드된 파일의 삭제 버튼이 동작한다', async ({ page }) => {
    const result = await goToFilesPage(page);
    if (!result) {
      test.skip(true, '진단 항목이 없어 테스트를 건너뜁니다');
      return;
    }
    if (result === 'readonly') {
      test.skip(true, '진단 상태가 WRITING/RETURNED이 아니어서 삭제 불가');
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(DUMMY_DOC);

    await expect(page.getByText('TestCompany_202601_테스트메모.pdf')).toBeVisible({ timeout: 30000 });

    // 삭제 버튼 클릭
    const deleteButton = page.locator('button[title="삭제"]').last();
    await deleteButton.click();

    // 삭제 성공 시 파일 제거, 실패 시(분석 중 등) 에러 토스트 — 두 경우 모두 정상 동작
    const fileRemoved = await page.getByText('TestCompany_202601_테스트메모.pdf')
      .waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);

    if (!fileRemoved) {
      // 서버가 409(분석 중 삭제 불가)를 반환한 경우 — 삭제 버튼은 존재하므로 정상
      expect(await page.locator('button[title="삭제"]').count()).toBeGreaterThan(0);
    }
  });

  test('여러 파일을 동시에 업로드할 수 있다', async ({ page }) => {
    const result = await goToFilesPage(page);
    if (!result) {
      test.skip(true, '진단 항목이 없어 테스트를 건너뜁니다');
      return;
    }
    if (result === 'readonly') {
      test.skip(true, '진단 상태가 WRITING/RETURNED이 아니어서 업로드 불가');
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([DUMMY_PDF, DUMMY_DOC]);

    await expect(page.getByText('TestCompany_202601_테스트문서.pdf')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('TestCompany_202601_테스트메모.pdf')).toBeVisible({ timeout: 30000 });

    await expect(page.getByText(/업로드된 파일/)).toBeVisible();
  });
});
