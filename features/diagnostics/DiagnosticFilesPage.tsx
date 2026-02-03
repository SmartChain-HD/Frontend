import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDiagnosticDetail } from '../../src/hooks/useDiagnostics';
import { useDiagnosticFiles, useParsingResult, useDeleteFile } from '../../src/hooks/useFiles';
import { useJobPolling, useRetryJob } from '../../src/hooks/useJobs';
import { QUERY_KEYS } from '../../src/constants/queryKeys';
import {
  useAiPreview,
  useSubmitAiRun,
  useAiResult,
} from '../../src/hooks/useAiRun';
import * as filesApi from '../../src/api/files';
import type { JobStatus } from '../../src/api/jobs';
import type {
  SlotStatus,
  AiAnalysisResultResponse,
  SlotResultDetail,
  ClarificationDetail,
} from '../../src/api/aiRun';
import type { RiskLevel, DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

// 파일 업로드 상태 타입
type FileUploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

type Verdict = 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';

interface UploadedFile {
  id: number;
  name: string;
  jobId: string;
  uploadStatus: FileUploadStatus;
  uploadProgress: number;
  processingStatus: JobStatus;
  processingStep?: string;
  processingProgress?: number;
  errorMessage?: string;
}

// 처리 단계 레이블
const PROCESSING_STEP_LABELS: Record<string, string> = {
  OCR: 'OCR 처리 중',
  PARSING: '파싱 중',
  VALIDATION: '검증 중',
  METRICS: '지표 계산 중',
};

const JOB_STATUS_TO_STEP: Record<JobStatus, string> = {
  PENDING: '대기중',
  RUNNING: '처리중',
  SUCCEEDED: '완료',
  FAILED: '실패',
};

// 상태별 스타일
const STATUS_STYLES: Record<FileUploadStatus, { bg: string; text: string; border: string }> = {
  idle: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  uploading: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  processing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  complete: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const VERDICT_LABELS: Record<Verdict, string> = {
  PASS: '적합',
  WARN: '경고',
  NEED_CLARIFY: '확인 필요',
  NEED_FIX: '수정 필요',
};

const VERDICT_STYLES: Record<Verdict, string> = {
  PASS: 'bg-green-100 text-green-700 border-green-200',
  WARN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  NEED_CLARIFY: 'bg-orange-100 text-orange-700 border-orange-200',
  NEED_FIX: 'bg-red-100 text-red-700 border-red-200',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: '낮음',
  MEDIUM: '중간',
  HIGH: '높음',
};

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-red-50 text-red-700',
};

// extras 키-라벨 매핑
const EXTRAS_LABELS: Record<string, string> = {
  anomalies: '⚠️ 이상 징후',
  missing_fields: '📝 누락된 항목',
  missing_slots: '📝 누락된 슬롯',
  violations: '🚫 위반 사항',
  summary: '📄 문서 요약',
  detected_objects: '🔍 감지된 객체',
  person_count: '👥 감지 인원',
  scene_description: '📸 상황 묘사',
  detail: 'ℹ️ 상세 정보',
};

// reason 코드-한글 매핑
const REASON_LABELS: Record<string, string> = {
  // 공통
  MISSING_SLOT: '필수 슬롯 누락',
  HEADER_MISMATCH: '필수 헤더(컬럼) 누락',
  EMPTY_TABLE: '표/데이터 행이 비어있음',
  OCR_FAILED: 'OCR 판독 불가/텍스트 추출 실패',
  WRONG_YEAR: '문서 대상 연도 불일치',
  PARSE_FAILED: '파싱 실패',
  DATE_MISMATCH: '기간 불일치',
  UNIT_MISSING: '단위 누락',
  EVIDENCE_MISSING: '근거문서 누락',
  SIGNATURE_MISSING: '확인 서명란 미기재',

  // Compliance
  KEYWORD_MISSING: '표준 계약서 필수 조항 누락',
  LOW_EDUCATION_RATE: '교육 이수율 기준 미달',
  DATA_NOT_FOUND: '데이터 식별 불가',
  HIGH_RISK_DETECTED: '위험요소 발견 후 미조치',
  MISSING_MANDATORY_TRAINING: '법정의무 교육 계획 누락',

  // ESG 에너지
  E1_NEGATIVE_OR_ZERO: '사용량이 0 또는 음수',
  E1_DATE_PARSE_FAILED: '날짜 파싱 실패',
  E1_DUPLICATE_DATE: '날짜 중복',
  E1_GAP_DETECTED: '기간 연속성 결함',
  E2_SPIKE_DETECTED: '사용량 급증/급감 이상치',
  E3_BILL_MISMATCH: '고지서 합계와 사용량 합계 불일치',
  E3_BILL_PERIOD_UNCERTAIN: '고지서 기간 추출 불확실',
  E4_GHG_EVIDENCE_MISSING: '온실가스 산정 근거 문서 누락',

  // ESG 유해물질
  E5_MSDS_MISSING: '유해물질 목록 대비 MSDS 누락',
  E6_STOCK_SPIKE: '유해물질 수량 급증',
  E6_INSPECTION_OVERDUE: '점검일 경과',
  E7_DISPOSAL_INCONSISTENT: '폐기/처리 정합성 불일치',

  // ESG 윤리
  E8_OLD_REVISION: '윤리강령 개정일이 오래됨',
  E8_MISSING_SECTIONS: '윤리강령 필수 섹션 누락',
  E8_MULTI_VERSION: '여러 버전 동시 제출',
  E9_NO_DISTRIBUTION_LOG: '배포/수신확인 로그 누락',
  E9_NO_PLEDGE: '서약서 누락',
  E9_PLEDGE_BEFORE_REVISION: '서약일이 개정일보다 과거',
  E9_DISTR_BEFORE_REVISION: '배포일이 개정일보다 과거',
  G_OCR_UNREADABLE: '문서 판독 불가',

  // Safety 교육
  EDU_DEPT_ZERO: '특정 부서/직무 이수율 0%',
  EDU_RATE_SPIKE: '이수율 전월 대비 30%p 이상 급변',
  EDU_FUTURE_DATE: '교육일이 미래 날짜',

  // Safety 위험성평가
  RISK_ACTION_MISSING: '감소대책/조치 항목 누락',
  RISK_OWNER_MISSING: '담당자 정보 누락',
  RISK_CHECKDATE_MISSING: '점검일 누락',

  // Safety 안전보건관리체계
  MISSING_SECTION_ORG: '조직/책임/권한 섹션 없음',
  MISSING_SECTION_RISK: '위험성평가 섹션 없음',
  MISSING_SECTION_INCIDENT: '사고 대응 절차 섹션 없음',
  MISSING_SECTION_TRAINING: '교육/점검 섹션 없음',
  MISSING_SECTION_IMPROVE: '개선조치 섹션 없음',

  // Safety 소방
  FIRE_ALL_GOOD_PATTERN: '항목이 항상 양호로만 반복',
  FIRE_COPYPASTE_PATTERN: '총평/체크패턴 반복',

  // 교차 검증
  CROSS_HEADCOUNT_MISMATCH: '출석부 인원수와 교육사진 인원수 불일치',
  CROSS_ATTENDANCE_PARSE_FAILED: '출석부에서 인원수 추출 실패',
  CROSS_PHOTO_COUNT_FAILED: '교육사진에서 인원수 감지 실패',

  // LLM 공통
  LLM_ANOMALY_DETECTED: 'AI가 문서 이상 징후를 감지함',
  LLM_MISSING_FIELDS: 'AI가 누락 항목을 감지함',
  VIOLATION_DETECTED: 'AI가 위반 사항을 감지함',
};

// 업로드 아이템 컴포넌트
function FileUploadItem({
  file,
  onRetry,
  onDelete,
  onSelect,
  isSelected,
  isRetrying,
  isDeleting,
  autoTag,
}: {
  file: UploadedFile;
  onRetry: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isRetrying: boolean;
  isDeleting: boolean;
  autoTag?: string;
}) {
  const style = STATUS_STYLES[file.uploadStatus];
  const progress = file.uploadStatus === 'uploading'
    ? file.uploadProgress
    : file.uploadStatus === 'processing'
      ? (file.processingProgress || 50)
      : file.uploadStatus === 'complete'
        ? 100
        : 0;

  const statusLabel = file.uploadStatus === 'uploading'
    ? `업로드 중 ${file.uploadProgress}%`
    : file.uploadStatus === 'processing'
      ? (file.processingStep ? PROCESSING_STEP_LABELS[file.processingStep] || file.processingStep : JOB_STATUS_TO_STEP[file.processingStatus])
      : file.uploadStatus === 'complete'
        ? '완료'
        : file.uploadStatus === 'error'
          ? '실패'
          : '대기중';

  return (
    <div
      className={`rounded-[12px] border-2 overflow-hidden transition-all ${style.border} ${
        isSelected ? 'ring-2 ring-[var(--color-primary-main)]' : ''
      }`}
    >
      {/* 상단: 파일 정보 */}
      <div
        onClick={file.uploadStatus === 'complete' ? onSelect : undefined}
        className={`px-[16px] py-[14px] flex items-center gap-[12px] ${style.bg} ${
          file.uploadStatus === 'complete' ? 'cursor-pointer hover:brightness-95' : ''
        }`}
      >
        {/* 파일 아이콘 */}
        <div className="w-[44px] h-[44px] rounded-[10px] bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
          {file.uploadStatus === 'uploading' || file.uploadStatus === 'processing' ? (
            <div className="w-[20px] h-[20px] border-[2px] border-current border-t-transparent rounded-full animate-spin text-[var(--color-primary-main)]" />
          ) : file.uploadStatus === 'complete' ? (
            <svg className="w-[22px] h-[22px] text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : file.uploadStatus === 'error' ? (
            <svg className="w-[22px] h-[22px] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-[22px] h-[22px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* 파일 정보 */}
        <div className="flex-1 min-w-0">
          <p className="font-body-medium text-[var(--color-text-primary)] truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-[8px] mt-[2px]">
            <p className={`font-title-xsmall ${style.text}`}>
              {statusLabel}
            </p>
            {autoTag && file.uploadStatus === 'complete' && (
              <span className="px-[6px] py-[1px] bg-blue-100 text-blue-700 text-xs font-medium rounded">
                Auto-tag: {autoTag}
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-[8px]">
          {file.uploadStatus === 'error' && (
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
              disabled={isRetrying}
              className="px-[12px] py-[6px] rounded-[8px] bg-white border border-red-200 font-title-xsmall text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-[6px]"
            >
              {isRetrying ? (
                <div className="w-[14px] h-[14px] border-[2px] border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              재시도
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting || file.uploadStatus === 'uploading'}
            className="p-[8px] rounded-[8px] hover:bg-white/80 transition-colors disabled:opacity-50"
            title="삭제"
          >
            <svg className="w-[18px] h-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 하단: 진행률 바 */}
      {(file.uploadStatus === 'uploading' || file.uploadStatus === 'processing') && (
        <div className="px-[16px] pb-[12px] pt-[4px] bg-white">
          <div className="flex items-center gap-[12px]">
            <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  file.uploadStatus === 'uploading' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-detail-small text-gray-500 w-[40px] text-right">
              {progress}%
            </span>
          </div>
          {/* 처리 단계 표시 */}
          {file.uploadStatus === 'processing' && (
            <div className="flex items-center gap-[16px] mt-[10px]">
              {['OCR', 'PARSING', 'VALIDATION', 'METRICS'].map((step, index) => {
                const currentStepIndex = file.processingStep
                  ? ['OCR', 'PARSING', 'VALIDATION', 'METRICS'].indexOf(file.processingStep)
                  : 0;
                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;

                return (
                  <div key={step} className="flex items-center gap-[6px]">
                    <div className={`w-[16px] h-[16px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-amber-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isComplete ? '✓' : index + 1}
                    </div>
                    <span className={`font-detail-small ${
                      isActive ? 'text-amber-700 font-medium' : 'text-gray-400'
                    }`}>
                      {PROCESSING_STEP_LABELS[step]?.replace(' 중', '') || step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {file.uploadStatus === 'error' && file.errorMessage && (
        <div className="px-[16px] pb-[12px] bg-white">
          <p className="font-body-small text-red-600">
            {file.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

// 슬롯 체크리스트 컴포넌트
function SlotChecklist({
  slots,
  submittedSlots,
  missingRequired,
  isLoading,
}: {
  slots: SlotStatus[];
  submittedSlots: Set<string>;
  missingRequired: string[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[20px]">
        <div className="w-[20px] h-[20px] border-[2px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-[20px]">
        <p className="font-body-small text-[var(--color-text-tertiary)]">
          슬롯 목록 없음
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[8px]">
      {slots.map((slot, index) => (
        <SlotCheckItem
          key={index}
          slotName={slot.slot_name}
          isSubmitted={submittedSlots.has(slot.slot_name)}
          isRequired={missingRequired.includes(slot.slot_name)}
        />
      ))}
    </div>
  );
}

function SlotCheckItem({ slotName, isSubmitted, isRequired }: { slotName: string; isSubmitted: boolean; isRequired: boolean }) {
  return (
    <div className="flex items-center gap-[10px] py-[4px]">
      {isSubmitted ? (
        <svg className="w-[20px] h-[20px] text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={`font-body-medium flex-1 ${isSubmitted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
        {slotName}
        {isRequired && !isSubmitted && (
          <span className="text-[var(--color-text-tertiary)] ml-[4px]">(필수)</span>
        )}
      </span>
    </div>
  );
}

// 분석 결과 섹션 컴포넌트
function AiResultSection({ result }: { result: AiAnalysisResultResponse }) {
  const verdict = result.verdict as Verdict;
  const riskLevel = result.riskLevel as RiskLevel;
  const details = result.details;

  return (
    <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
      <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)]">
        <h2 className="font-title-medium text-[var(--color-text-primary)]">
          분석 결과
        </h2>
      </div>

      <div className="p-[20px] space-y-[24px]">
        {/* 판정 결과 */}
        <div className="flex items-center gap-[16px]">
          <div className={`px-[16px] py-[10px] rounded-[8px] border ${VERDICT_STYLES[verdict]}`}>
            <span className="font-title-medium">{VERDICT_LABELS[verdict]}</span>
          </div>
          <div className={`px-[12px] py-[6px] rounded-full ${RISK_STYLES[riskLevel]}`}>
            <span className="font-title-xsmall">위험도: {RISK_LABELS[riskLevel]}</span>
          </div>
        </div>

        {/* 요약 */}
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">분석 요약</p>
          <p className="font-body-medium text-[var(--color-text-primary)] leading-[1.6]">
            {result.whySummary}
          </p>
        </div>

        {/* 슬롯별 결과 */}
        {details?.slot_results && details.slot_results.length > 0 && (
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[12px]">
              슬롯별 분석 결과
            </p>
            <div className="space-y-[12px]">
              {details.slot_results.map((slotResult, index) => (
                <SlotResultCard key={index} result={slotResult} />
              ))}
            </div>
          </div>
        )}

        {/* 참고사항 */}
        {details?.extras && Object.keys(details.extras).length > 0 && (
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[12px]">
              참고사항
            </p>
            <div className="p-[16px] bg-gray-50 rounded-[12px] space-y-[8px]">
              {Object.entries(details.extras as Record<string, string>)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <div key={key} className="font-body-small text-[var(--color-text-secondary)]">
                    <span className="font-medium">{EXTRAS_LABELS[key] || key}:</span> {value}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 분석 정보 */}
        <div className="grid grid-cols-2 gap-[16px] pt-[16px] border-t border-[var(--color-border-default)]">
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">도메인</p>
            <p className="font-body-medium text-[var(--color-text-primary)]">
              {DOMAIN_LABELS[result.domainCode as DomainCode] || result.domainCode}
            </p>
          </div>
          <div>
            <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">분석 일시</p>
            <p className="font-body-medium text-[var(--color-text-primary)]">
              {new Date(result.analyzedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 슬롯별 결과 카드
function SlotResultCard({ result }: { result: SlotResultDetail }) {
  const verdict = result.verdict as Verdict;

  return (
    <div className="p-[16px] bg-gray-50 rounded-[12px]">
      <div className="flex items-center justify-between mb-[8px]">
        <span className="font-title-small text-[var(--color-text-primary)]">
          {result.slot_name}
        </span>
        <span className={`px-[8px] py-[2px] rounded text-xs font-medium border ${VERDICT_STYLES[verdict]}`}>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {/* reasons 표시 */}
      {result.reasons && result.reasons.length > 0 && (
        <ul className="space-y-[4px] mt-[8px]">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-[6px] font-body-small text-[var(--color-text-secondary)]">
              <span className="w-[4px] h-[4px] bg-gray-400 rounded-full mt-[6px] flex-shrink-0" />
              {REASON_LABELS[reason] || reason}
            </li>
          ))}
        </ul>
      )}

      {result.file_names && result.file_names.length > 0 && (
        <div className="mt-[8px] flex flex-wrap gap-[6px]">
          {result.file_names.map((fileName, index) => (
            <span key={index} className="px-[8px] py-[2px] bg-white text-xs text-gray-600 rounded border border-gray-200">
              {fileName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 보완 요청 카드
function ClarificationCard({ clarification }: { clarification: ClarificationDetail }) {
  return (
    <div className="p-[16px] bg-orange-50 rounded-[12px] border border-orange-200">
      <div className="flex items-start gap-[12px]">
        <svg className="w-[20px] h-[20px] text-orange-500 flex-shrink-0 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <p className="font-title-small text-orange-700 mb-[4px]">
            {clarification.slot_name}
          </p>
          <p className="font-body-small text-orange-600">
            {clarification.message}
          </p>
        </div>
      </div>
    </div>
  );
}

// 파싱 결과 컴포넌트
function ParsingResultView({ diagnosticId, fileId }: { diagnosticId: number; fileId: number }) {
  const { data: parsingResult, isLoading, isError } = useParsingResult(diagnosticId, fileId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[40px]">
        <div className="w-[24px] h-[24px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !parsingResult) {
    return (
      <div className="text-center py-[40px]">
        <p className="font-body-medium text-red-500">
          파싱 결과를 불러올 수 없습니다
        </p>
      </div>
    );
  }

  const metaInfo = parsingResult.metaInfo ? (() => {
    try { return JSON.parse(parsingResult.metaInfo); } catch { return null; }
  })() : null;

  return (
    <div className="space-y-[20px]">
      {/* 파일 정보 */}
      <div>
        <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">파일명</p>
        <p className="font-body-medium text-[var(--color-text-primary)]">{parsingResult.fileName}</p>
      </div>

      <div className="flex items-center gap-[12px]">
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">상태</p>
          <span className={`px-[8px] py-[2px] rounded text-xs font-medium ${
            parsingResult.parsingStatus === 'SUCCESS'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {parsingResult.parsingStatus === 'SUCCESS' ? '성공' : parsingResult.parsingStatus}
          </span>
        </div>
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">파싱 완료</p>
          <p className="font-body-medium text-[var(--color-text-primary)]">
            {new Date(parsingResult.completedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 메타 정보 */}
      {metaInfo && (
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">분석 정보</p>
          <div className="space-y-[8px]">
            {metaInfo.slotHintCount != null && (
              <div className="flex items-center justify-between px-[12px] py-[8px] bg-gray-50 rounded-[8px]">
                <span className="font-body-small text-[var(--color-text-primary)]">감지된 슬롯</span>
                <span className="font-title-xsmall text-[var(--color-text-primary)]">{metaInfo.slotHintCount}개</span>
              </div>
            )}
            {metaInfo.missingRequiredSlots != null && (
              <div className="flex items-center justify-between px-[12px] py-[8px] bg-gray-50 rounded-[8px]">
                <span className="font-body-small text-[var(--color-text-primary)]">누락 필수 슬롯</span>
                <span className={`font-title-xsmall ${metaInfo.missingRequiredSlots > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metaInfo.missingRequiredSlots}개
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 파싱된 텍스트 */}
      {parsingResult.parsedText && (
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">파싱 결과</p>
          <div className="p-[12px] bg-gray-50 rounded-[8px] max-h-[200px] overflow-y-auto">
            <p className="font-body-small text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {parsingResult.parsedText}
            </p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {parsingResult.errorMessage && (
        <div className="p-[12px] bg-red-50 rounded-[8px]">
          <p className="font-body-small text-red-600">{parsingResult.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function DiagnosticFilesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const diagnosticId = Number(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: diagnostic, isLoading: isDiagnosticLoading } = useDiagnosticDetail(diagnosticId);
  const { data: existingFiles } = useDiagnosticFiles(diagnosticId);
  const deleteMutation = useDeleteFile();
  const retryMutation = useRetryJob();

  const [newlyUploadedFiles, setNewlyUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI 분석 관련 훅
  const previewMutation = useAiPreview();
  const submitMutation = useSubmitAiRun();
  // 분석 중일 때만 polling (평소에는 1회만 호출)
  const { data: aiResult } = useAiResult(diagnosticId, isAnalyzing);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 모든 업로드된 파일 표시
  // 새로 업로드한 파일 상태를 우선 사용 (job polling 결과 반영)
  const uploadedFiles = useMemo(() => {
    // 새로 업로드한 파일 ID Set (우선순위 높음)
    const newFileIds = new Set(newlyUploadedFiles.map(f => f.id));

    // 기존 파일 중 새로 업로드한 파일과 중복되지 않는 것만
    const existingUploadedFiles: UploadedFile[] = (existingFiles || [])
      .filter(f => !newFileIds.has(f.fileId))
      .map(f => ({
        id: f.fileId,
        name: f.fileName,
        jobId: '',
        uploadStatus: f.parsingStatus === 'SUCCESS' ? 'complete' : f.parsingStatus === 'FAILED' ? 'error' : 'processing',
        uploadProgress: 100,
        processingStatus: f.parsingStatus === 'SUCCESS' ? 'SUCCEEDED' : f.parsingStatus === 'FAILED' ? 'FAILED' : 'RUNNING',
      } as UploadedFile));

    // 새로 업로드한 파일을 먼저 배치 (상태가 정확함)
    return [...newlyUploadedFiles, ...existingUploadedFiles];
  }, [existingFiles, newlyUploadedFiles]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // preview API 호출용: 모든 완료된 파일 ID (기존 파일 + 새로 업로드한 파일)
  const allCompletedFileIds = useMemo(() => {
    const existingIds = (existingFiles || [])
      .filter(f => f.parsingStatus === 'SUCCESS')
      .map(f => f.fileId);
    const newIds = newlyUploadedFiles
      .filter(f => f.uploadStatus === 'complete')
      .map(f => f.id);
    return [...new Set([...existingIds, ...newIds])];
  }, [existingFiles, newlyUploadedFiles]);

  // UI 표시용: uploadedFiles에서 완료된 파일 수
  const completedFileIds = uploadedFiles
    .filter(f => f.uploadStatus === 'complete')
    .map(f => f.id);

  // 페이지 로드 시 초기 preview 호출 (필수 슬롯 목록용)
  useEffect(() => {
    if (diagnosticId > 0) {
      callPreview([]);
    }
  }, [diagnosticId]);

  // 분석 완료 감지
  useEffect(() => {
    if (isAnalyzing && aiResult) {
      setIsAnalyzing(false);
    }
  }, [aiResult, isAnalyzing]);

  // Job polling for files in processing state
  const processingFile = newlyUploadedFiles.find(f => f.uploadStatus === 'processing');
  const { data: jobStatus } = useJobPolling(processingFile?.jobId || null);

  // Update file status when job status changes
  useEffect(() => {
    if (jobStatus && processingFile) {
      const needsUpdate = processingFile.processingStatus !== jobStatus.status ||
                          processingFile.processingProgress !== jobStatus.progress;

      if (needsUpdate) {
        const newUploadStatus: FileUploadStatus =
          jobStatus.status === 'SUCCEEDED' ? 'complete' :
          jobStatus.status === 'FAILED' ? 'error' : 'processing';

        setNewlyUploadedFiles(prev =>
          prev.map(f => f.jobId === processingFile.jobId
            ? {
                ...f,
                uploadStatus: newUploadStatus,
                processingStatus: jobStatus.status,
                processingProgress: jobStatus.progress,
                processingStep: (jobStatus.result as { step?: string })?.step,
                errorMessage: jobStatus.errorMessage,
              }
            : f
          )
        );

        // job 완료 시 existingFiles 쿼리 갱신
        if (jobStatus.status === 'SUCCEEDED' || jobStatus.status === 'FAILED') {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.LIST(diagnosticId) });
        }
      }
    }
  }, [jobStatus, processingFile, queryClient, diagnosticId]);

  // 슬롯 힌트에서 파일 ID로 슬롯명 찾기
  const getAutoTagForFile = useCallback((fileId: number): string | undefined => {
    const slotHints = previewMutation.data?.slot_hint || [];
    const hint = slotHints.find(h => h.file_id === String(fileId));
    return hint?.slot_name;
  }, [previewMutation.data?.slot_hint]);

  // preview 호출 함수
  const callPreview = useCallback((fileIds: number[]) => {
    if (diagnosticId > 0) {
      previewMutation.mutate({ diagnosticId, fileIds });
    }
  }, [diagnosticId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFilesUpload(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFilesUpload(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    for (const file of files) {
      const tempId = Date.now();

      // Add file with uploading status
      setNewlyUploadedFiles(prev => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          jobId: '',
          uploadStatus: 'uploading',
          uploadProgress: 0,
          processingStatus: 'PENDING',
        },
      ]);

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const result = await filesApi.uploadFile(diagnosticId, file, {
          signal: controller.signal,
          onUploadProgress: (progress) => {
            setNewlyUploadedFiles(prev =>
              prev.map(f => f.id === tempId
                ? { ...f, uploadProgress: progress }
                : f
              )
            );
          },
        });

        // Update to processing status
        setNewlyUploadedFiles(prev =>
          prev.map(f => f.id === tempId
            ? {
                ...f,
                id: result.fileId,
                name: result.originalFileName || result.fileName,
                jobId: result.jobId,
                uploadStatus: 'processing',
                uploadProgress: 100,
                processingStatus: 'PENDING',
              }
            : f
          )
        );
      } catch (error) {
        // Update to error status
        const errorMsg = error instanceof Error ? error.message : '업로드에 실패했습니다.';
        setNewlyUploadedFiles(prev =>
          prev.map(f => f.id === tempId
            ? { ...f, uploadStatus: 'error', errorMessage: errorMsg }
            : f
          )
        );
      }
    }
  };

  const handleRetry = async (file: UploadedFile) => {
    if (file.jobId) {
      // Retry job processing
      setNewlyUploadedFiles(prev =>
        prev.map(f => f.id === file.id
          ? { ...f, uploadStatus: 'processing', processingStatus: 'PENDING', errorMessage: undefined }
          : f
        )
      );
      try {
        await retryMutation.mutateAsync(file.jobId);
      } catch {
        setNewlyUploadedFiles(prev =>
          prev.map(f => f.id === file.id
            ? { ...f, uploadStatus: 'error', errorMessage: '재시도에 실패했습니다.' }
            : f
          )
        );
      }
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    // For files that failed during upload (no real file ID)
    if (file.uploadStatus === 'error' && !file.jobId) {
      setNewlyUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }

    try {
      await deleteMutation.mutateAsync(fileId);
      setNewlyUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleSubmitAiRun = () => {
    setShowSubmitModal(false);
    setIsAnalyzing(true);
    submitMutation.mutate(diagnosticId, {
      onError: () => {
        setIsAnalyzing(false);
      },
    });
  };

  if (isDiagnosticLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-[120px]">
          <div className="w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!diagnostic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-[120px] gap-[16px]">
          <p className="font-body-medium text-[var(--color-state-error-text)]">
            기안 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => navigate('/diagnostics')}
            className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const previewData = previewMutation.data;
  const requiredSlotStatus = previewData?.required_slot_status || [];
  const missingRequiredSlots = previewData?.missing_required_slots || [];
  const hasMissingRequiredSlots = missingRequiredSlots.length > 0;

  // required_slot_status에서 SUBMITTED 상태인 슬롯 Set 생성
  const submittedSlots = useMemo(() => {
    return new Set(
      requiredSlotStatus
        .filter(slot => slot.status === 'SUBMITTED')
        .map(slot => slot.slot_name)
    );
  }, [requiredSlotStatus]);

  const completedCount = completedFileIds.length;
  const processingCount = uploadedFiles.filter(f => f.uploadStatus === 'uploading' || f.uploadStatus === 'processing').length;
  const errorCount = uploadedFiles.filter(f => f.uploadStatus === 'error').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1200px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(`/diagnostics/${diagnosticId}`)}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          기안 상세로 돌아가기
        </button>

        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading-small text-[var(--color-text-primary)]">파일 업로드 및 관리</h1>
            <p className="font-body-medium text-[var(--color-text-tertiary)] mt-[8px]">
              {diagnostic.campaign?.title || diagnostic.diagnosticCode}
            </p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="flex items-center gap-[16px] text-sm">
              {processingCount > 0 && (
                <span className="flex items-center gap-[6px] text-amber-600">
                  <span className="w-[8px] h-[8px] rounded-full bg-amber-500 animate-pulse" />
                  처리중 {processingCount}
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-[6px] text-red-600">
                  <span className="w-[8px] h-[8px] rounded-full bg-red-500" />
                  실패 {errorCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-[24px]">
          {/* 좌측: 업로드 영역 + 파일 목록 */}
          <div className="space-y-[24px]">
            {/* 가이드 */}
            <div className="bg-blue-50 rounded-[12px] p-[16px] flex gap-[12px]">
              <div className="w-[20px] h-[20px] rounded-full bg-[var(--color-primary-main)] flex items-center justify-center flex-shrink-0 mt-[2px]">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-title-xsmall text-[var(--color-primary-main)] mb-[4px]">
                  파일명 가이드
                </p>
                <p className="font-body-small text-[var(--color-text-secondary)]">
                  협력사명_기간_자료명 (예: ABC건설_202601_TBM일지.pdf)
                </p>
              </div>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[12px] p-[48px] text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[var(--color-primary-main)] bg-blue-50'
                  : 'border-[var(--color-border-default)] hover:border-[var(--color-primary-light)] hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg className="w-[48px] h-[48px] mx-auto mb-[16px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="font-title-medium text-[var(--color-text-primary)] mb-[8px]">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="font-body-small text-[var(--color-text-tertiary)]">
                PDF, JPG, PNG, XLSX, DOC 파일 지원 (최대 50MB)
              </p>
            </div>

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-[12px]">
                <h3 className="font-title-small text-[var(--color-text-primary)]">
                  업로드된 파일 ({uploadedFiles.length})
                </h3>
                {uploadedFiles.map((file) => (
                  <FileUploadItem
                    key={file.id}
                    file={file}
                    onRetry={() => handleRetry(file)}
                    onDelete={() => handleDeleteFile(file.id)}
                    onSelect={() => setSelectedFileId(file.id)}
                    isSelected={selectedFileId === file.id}
                    isRetrying={retryMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                    autoTag={getAutoTagForFile(file.id)}
                  />
                ))}

                {/* Add 버튼 */}
                <button
                  onClick={() => callPreview(allCompletedFileIds)}
                  disabled={previewMutation.isPending || completedCount === 0}
                  className="w-full py-[12px] rounded-[10px] border-2 border-dashed border-[var(--color-primary-light)] text-[var(--color-primary-main)] font-title-small hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
                >
                  {previewMutation.isPending ? (
                    <>
                      <span className="w-[16px] h-[16px] border-[2px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                      매칭 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                       Add (파일 추가 및 미리보기)
                    </>
                  )}
                </button>

                {/* 최종 제출 버튼 */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isAnalyzing || submitMutation.isPending || completedCount === 0}
                  className="w-full py-[14px] rounded-[10px] bg-[var(--color-primary-main)] text-white font-title-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
                >
                  {isAnalyzing || submitMutation.isPending ? (
                    <>
                      <span className="w-[18px] h-[18px] border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    '최종 제출 (결과 확인)'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 우측: 필수 첨부 자료 리스트 */}
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] h-fit sticky top-[24px]">
            <div className="px-[20px] py-[14px] border-b border-[var(--color-border-default)]">
              <h3 className="font-title-small text-[var(--color-text-primary)]">
                필수 첨부 자료 리스트
              </h3>
            </div>
            <div className="px-[20px] py-[16px]">
              <SlotChecklist
                slots={requiredSlotStatus}
                submittedSlots={submittedSlots}
                missingRequired={missingRequiredSlots}
                isLoading={previewMutation.isPending}
              />
            </div>
          </div>
        </div>


        {/* 분석 결과 섹션 */}
        {isAnalyzing && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[40px]">
            <div className="flex flex-col items-center justify-center gap-[16px]">
              <div className="w-[48px] h-[48px] border-[4px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
              <p className="font-body-medium text-[var(--color-text-secondary)]">
                AI가 문서를 분석 중입니다...
              </p>
              <p className="font-body-small text-[var(--color-text-tertiary)]">
                분석에 시간이 걸릴 수 있습니다
              </p>
            </div>
          </div>
        )}

        {!isAnalyzing && aiResult && (
          <AiResultSection result={aiResult} />
        )}

        {/* 파싱 결과 미리보기 (선택된 파일이 있을 때) */}
        {selectedFileId && (
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)]">
            <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)] flex items-center justify-between">
              <h3 className="font-title-medium text-[var(--color-text-primary)]">
                파싱 결과
              </h3>
              <button
                onClick={() => setSelectedFileId(null)}
                className="p-[4px] hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-[20px]">
              <ParsingResultView diagnosticId={diagnosticId} fileId={selectedFileId} />
            </div>
          </div>
        )}
      </div>

      {/* 분석 실행 확인 모달 */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[16px] w-full max-w-[480px] mx-[16px] shadow-xl">
            <div className="px-[24px] py-[20px] border-b border-[var(--color-border-default)]">
              <h2 className="font-title-medium text-[var(--color-text-primary)]">
                AI 분석 실행
              </h2>
            </div>

            <div className="px-[24px] py-[20px]">
              <p className="font-body-medium text-[var(--color-text-secondary)]">
                업로드된 파일을 기반으로 AI 분석을 실행합니다.
              </p>
              <p className="font-body-small text-[var(--color-text-tertiary)] mt-[8px]">
                분석에는 시간이 걸릴 수 있으며, 완료되면 결과가 표시됩니다.
              </p>

              {hasMissingRequiredSlots && (
                <div className="mt-[16px] p-[12px] bg-yellow-50 rounded-[8px] border border-yellow-200">
                  <div className="flex items-start gap-[8px]">
                    <svg className="w-[16px] h-[16px] text-yellow-600 flex-shrink-0 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-body-small text-yellow-700">
                      일부 필수 항목이 누락되었습니다. 분석 결과에 영향을 줄 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {completedCount > 0 && (
                <div className="mt-[16px] p-[12px] bg-gray-50 rounded-[8px]">
                  <p className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px]">
                    분석 대상 ({completedCount}개 파일)
                  </p>
                  <div className="space-y-[6px] max-h-[200px] overflow-y-auto">
                    {uploadedFiles.filter(f => f.uploadStatus === 'complete').map(f => (
                      <div key={f.id} className="flex items-center gap-[8px] px-[8px] py-[6px] bg-white rounded-[6px]">
                        <svg className="w-[16px] h-[16px] text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-body-small text-[var(--color-text-primary)] truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-[24px] py-[16px] border-t border-[var(--color-border-default)] flex justify-end gap-[12px]">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitAiRun}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] font-title-small text-white hover:opacity-90 transition-colors"
              >
                분석 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
