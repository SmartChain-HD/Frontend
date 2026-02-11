import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import type { AxiosError } from 'axios';
import type { JobStatus } from '../../src/api/jobs';
import type { SlotStatus, SlotHint } from '../../src/api/aiRun';
import type { ErrorResponse } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

// 파일 업로드 상태 타입
type FileUploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

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



// 업로드 아이템 컴포넌트 (컴팩트 리스트형)
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
  const progress = file.uploadStatus === 'uploading'
    ? file.uploadProgress
    : file.uploadStatus === 'processing'
      ? (file.processingProgress || 50)
      : file.uploadStatus === 'complete'
        ? 100
        : 0;

  const statusLabel = file.uploadStatus === 'uploading'
    ? `업로드 ${file.uploadProgress}%`
    : file.uploadStatus === 'processing'
      ? (file.processingStep ? PROCESSING_STEP_LABELS[file.processingStep] || file.processingStep : JOB_STATUS_TO_STEP[file.processingStatus])
      : file.uploadStatus === 'complete'
        ? '완료'
        : file.uploadStatus === 'error'
          ? '실패'
          : '대기중';

  const statusColor = file.uploadStatus === 'complete'
    ? 'bg-green-100 text-green-700'
    : file.uploadStatus === 'error'
      ? 'bg-red-100 text-red-700'
      : file.uploadStatus === 'uploading' || file.uploadStatus === 'processing'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-600';

  const isInProgress = file.uploadStatus === 'uploading' || file.uploadStatus === 'processing';

  return (
    <div
      onClick={file.uploadStatus === 'complete' ? onSelect : undefined}
      className={`px-[12px] py-[10px] rounded-[8px] border transition-all ${
        isSelected
          ? 'border-[var(--color-primary-main)] bg-blue-50/50'
          : 'border-[var(--color-border-default)] hover:border-gray-300'
      } ${file.uploadStatus === 'complete' ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-[10px]">
        {/* 상태 아이콘 */}
        <div className="flex-shrink-0">
          {isInProgress ? (
            <div className="w-[16px] h-[16px] border-[2px] border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : file.uploadStatus === 'complete' ? (
            <svg className="w-[16px] h-[16px] text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : file.uploadStatus === 'error' ? (
            <svg className="w-[16px] h-[16px] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-[16px] h-[16px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* 파일명 */}
        <p className="flex-1 min-w-0 font-body-medium text-[var(--color-text-primary)] truncate">
          {file.name}
        </p>

        {/* 태그 */}
        {autoTag && file.uploadStatus === 'complete' && (
          <span className="px-[6px] py-[2px] bg-blue-50 text-blue-600 font-body-small rounded flex-shrink-0">
            {autoTag}
          </span>
        )}

        {/* 상태 뱃지 */}
        <span className={`px-[6px] py-[2px] rounded font-body-small flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>

        {/* 액션 */}
        <div className="flex items-center gap-[4px] flex-shrink-0">
          {file.uploadStatus === 'error' && (
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
              disabled={isRetrying}
              className="p-[4px] rounded-[6px] text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
              title="재시도"
            >
              {isRetrying ? (
                <div className="w-[14px] h-[14px] border-[2px] border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting || file.uploadStatus === 'uploading'}
            className="p-[4px] rounded-[6px] text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            title="삭제"
          >
            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 진행률 바 (인라인) */}
      {isInProgress && (
        <div className="mt-[6px] ml-[26px]">
          <div className="flex items-center gap-[8px]">
            <div className="flex-1 h-[3px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  file.uploadStatus === 'uploading' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-body-small text-gray-400 w-[32px] text-right">
              {progress}%
            </span>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {file.uploadStatus === 'error' && file.errorMessage && (
        <p className="mt-[4px] ml-[26px] font-body-small text-red-500 truncate" title={file.errorMessage}>
          {file.errorMessage}
        </p>
      )}
    </div>
  );
}

// 슬롯 체크리스트 컴포넌트
function SlotChecklist({
  slots,
  submittedSlots,
  missingRequired,
  slotHints,
  fileIdToName,
  isLoading,
}: {
  slots: SlotStatus[];
  submittedSlots: Set<string>;
  missingRequired: string[];
  slotHints: SlotHint[];
  fileIdToName: Map<string, string>;
  isLoading: boolean;
}) {
  // slot_name → 매칭된 파일명 매핑
  const slotToFileName = useMemo(() => {
    const map = new Map<string, string>();
    slotHints.forEach(hint => {
      const fileName = fileIdToName.get(hint.file_id);
      if (fileName) {
        map.set(hint.slot_name, fileName);
      }
    });
    return map;
  }, [slotHints, fileIdToName]);

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
          slotName={slot.display_name || slot.slot_name}
          isSubmitted={submittedSlots.has(slot.slot_name)}
          isRequired={missingRequired.includes(slot.slot_name)}
          matchedFileName={slotToFileName.get(slot.slot_name)}
        />
      ))}
    </div>
  );
}

function SlotCheckItem({ slotName, isSubmitted, isRequired, matchedFileName }: { slotName: string; isSubmitted: boolean; isRequired: boolean; matchedFileName?: string }) {
  return (
    <div className="flex items-start gap-[10px] py-[6px]">
      {isSubmitted ? (
        <svg className="w-[20px] h-[20px] text-green-500 flex-shrink-0 mt-[2px]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 flex-shrink-0 mt-[2px]" />
      )}
      <div className="flex-1 min-w-0">
        <span className={`font-body-medium ${isSubmitted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {slotName}
          {isRequired && !isSubmitted && (
            <span className="text-[var(--color-text-tertiary)] ml-[4px]">(필수)</span>
          )}
        </span>
        {matchedFileName && (
          <p className="font-body-small text-[var(--color-text-tertiary)] truncate mt-[2px]" title={matchedFileName}>
            ↳ {matchedFileName}
          </p>
        )}
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
          <span className={`px-[8px] py-[2px] rounded font-detail-small ${
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
  const [isFileListCollapsed, setIsFileListCollapsed] = useState(false);
  const [addedFileIds, setAddedFileIds] = useState<Set<number>>(new Set());
  const [checkedPendingIds, setCheckedPendingIds] = useState<Set<number>>(new Set());
  const initialLoadDoneRef = useRef(false);

  // AI 분석 관련 훅
  const previewMutation = useAiPreview();
  const submitMutation = useSubmitAiRun();
  // 분석 중일 때만 polling (평소에는 1회만 호출)
  const { data: aiResult } = useAiResult(diagnosticId, isAnalyzing);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 재제출 시 이전 결과와 새 결과를 구분하기 위해 제출 시점의 analyzedAt 저장
  const prevAnalyzedAtRef = useRef<string | null>(null);

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

  // Add된 파일 / 아직 Add 안 된 파일 분리
  const addedFiles = uploadedFiles.filter(f => addedFileIds.has(f.id));
  const pendingFiles = uploadedFiles.filter(f => !addedFileIds.has(f.id));

  // UI 표시용: uploadedFiles에서 완료된 파일 수
  const completedFileIds = uploadedFiles
    .filter(f => f.uploadStatus === 'complete')
    .map(f => f.id);

  // preview 데이터 (조건부 return 이전에 정의해야 hooks 순서 유지)
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

  // 초기 로드 시 preview 자동 호출 (슬롯 목록을 즉시 표시)
  useEffect(() => {
    if (diagnosticId > 0 && existingFiles && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      // 기존 완료 파일을 addedFileIds에 자동 추가
      const existingCompleteIds = existingFiles
        .filter(f => f.parsingStatus === 'SUCCESS')
        .map(f => f.fileId);
      if (existingCompleteIds.length > 0) {
        setAddedFileIds(new Set(existingCompleteIds));
      }
      // preview 호출하여 슬롯 목록 로드
      previewMutation.mutate({ diagnosticId, fileIds: existingCompleteIds });
    }
  }, [diagnosticId, existingFiles]);

  // 분석 완료 감지 → 기안 상세 페이지로 리다이렉트
  // 재제출 시 이전 결과(analyzedAt 동일)와 새 결과를 구분
  useEffect(() => {
    if (isAnalyzing && aiResult) {
      // 이전 결과와 analyzedAt이 같으면 아직 새 결과가 아님 → skip
      if (prevAnalyzedAtRef.current && aiResult.analyzedAt === prevAnalyzedAtRef.current) {
        return;
      }
      setIsAnalyzing(false);
      prevAnalyzedAtRef.current = null;
      navigate(`/diagnostics/${diagnosticId}`);
    }
  }, [aiResult, isAnalyzing, navigate, diagnosticId]);

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
    return hint ? (hint.display_name || hint.slot_name) : undefined;
  }, [previewMutation.data?.slot_hint]);

  // file_id → file_name 매핑 (슬롯 체크리스트용)
  const fileIdToName = useMemo(() => {
    const map = new Map<string, string>();
    uploadedFiles.forEach(f => {
      map.set(String(f.id), f.name);
    });
    return map;
  }, [uploadedFiles]);


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
    if (!canUpload) {
      toast.error('현재 상태에서는 파일을 업로드할 수 없습니다.');
      return;
    }
    for (const file of files) {
      // 중복 파일 체크: 기존 파일 및 업로드 중인 파일과 이름 비교
      const existingFileNames = (existingFiles || []).map(f => f.fileName);
      const uploadingFileNames = newlyUploadedFiles.map(f => f.name);
      const allFileNames = [...existingFileNames, ...uploadingFileNames];

      if (allFileNames.includes(file.name)) {
        toast.error(`"${file.name}" 파일이 이미 존재합니다.`);
        continue;
      }

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
      // 파일 목록 쿼리 갱신
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.LIST(diagnosticId) });
      // 삭제된 파일을 제외한 나머지 파일로 preview 재호출 (완료 대기)
      const remainingFileIds = allCompletedFileIds.filter(id => id !== fileId);
      await previewMutation.mutateAsync({ diagnosticId, fileIds: remainingFileIds });
    } catch {
      // Error handled by mutation
    }
  };

  const handleSubmitAiRun = () => {
    setShowSubmitModal(false);
    // 이전 분석 결과의 analyzedAt을 저장하여 새 결과와 구분
    prevAnalyzedAtRef.current = aiResult?.analyzedAt ?? null;
    queryClient.removeQueries({ queryKey: QUERY_KEYS.AI_RUN.RESULT(diagnosticId) });
    setIsAnalyzing(true);
    const slotHints = (previewMutation.data?.slot_hint || []).map(h => ({
      file_id: h.file_id,
      slot_name: h.slot_name,
      display_name: h.display_name,
    }));
    submitMutation.mutate({ diagnosticId, slotHints }, {
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

  const canUpload = diagnostic.status === 'WRITING' || diagnostic.status === 'RETURNED';
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
              {diagnostic.title || diagnostic.summary || '제목 없음'}
            </p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="flex items-center gap-[16px] font-title-small">
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
                <span className="text-white font-detail-small font-bold">!</span>
              </div>
              <div>
                <p className="font-title-xsmall text-[var(--color-primary-main)] mb-[4px]">
                  파일명 가이드
                </p>
                <p className="font-body-small text-[var(--color-text-secondary)]">
                  날짜_협력사명_자료명 (예: 20260109_ABC건설_TBM일지.pdf)
                </p>
              </div>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            {canUpload ? (
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
            ) : (
              <div className="border-2 border-dashed rounded-[12px] p-[48px] text-center border-gray-200 bg-gray-50">
                <svg className="w-[48px] h-[48px] mx-auto mb-[16px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-title-medium text-gray-400 mb-[8px]">
                  현재 상태에서는 파일을 업로드할 수 없습니다
                </p>
                <p className="font-body-small text-gray-400">
                  작성중 또는 반려됨 상태에서만 파일 업로드가 가능합니다
                </p>
              </div>
            )}

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-[8px]">
                {/* 새로 업로드된 파일 (토글 밖, 항상 노출) */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-[6px]">
                    <div className="flex items-center justify-between pt-[4px]">
                      <h3 className="font-title-small text-[var(--color-text-primary)]">
                        새 파일 ({pendingFiles.length})
                      </h3>
                      {pendingFiles.filter(f => f.uploadStatus === 'complete').length > 0 && (
                        <button
                          onClick={() => {
                            const completePendingIds = pendingFiles
                              .filter(f => f.uploadStatus === 'complete')
                              .map(f => f.id);
                            const allChecked = completePendingIds.every(id => checkedPendingIds.has(id));
                            if (allChecked) {
                              setCheckedPendingIds(new Set());
                            } else {
                              setCheckedPendingIds(new Set(completePendingIds));
                            }
                          }}
                          className="font-body-small text-[var(--color-primary-main)] hover:underline"
                        >
                          {pendingFiles.filter(f => f.uploadStatus === 'complete').every(f => checkedPendingIds.has(f.id))
                            ? '전체 해제'
                            : '전체 선택'}
                        </button>
                      )}
                    </div>
                    {pendingFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-[8px]">
                        {file.uploadStatus === 'complete' ? (
                          <button
                            onClick={() => setCheckedPendingIds(prev => {
                              const next = new Set(prev);
                              if (next.has(file.id)) next.delete(file.id);
                              else next.add(file.id);
                              return next;
                            })}
                            className="flex-shrink-0"
                          >
                            <div className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                              checkedPendingIds.has(file.id)
                                ? 'bg-[var(--color-primary-main)] border-[var(--color-primary-main)]'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}>
                              {checkedPendingIds.has(file.id) && (
                                <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ) : (
                          <div className="w-[18px] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <FileUploadItem
                            file={file}
                            onRetry={() => handleRetry(file)}
                            onDelete={() => handleDeleteFile(file.id)}
                            onSelect={() => setSelectedFileId(file.id)}
                            isSelected={selectedFileId === file.id}
                            isRetrying={retryMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                            autoTag={getAutoTagForFile(file.id)}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add 버튼 */}
                    <button
                      onClick={() => {
                        const newAddedIds = new Set(addedFileIds);
                        checkedPendingIds.forEach(id => newAddedIds.add(id));
                        setAddedFileIds(newAddedIds);
                        const addedCompletedIds = uploadedFiles
                          .filter(f => newAddedIds.has(f.id) && f.uploadStatus === 'complete')
                          .map(f => f.id);
                        callPreview(addedCompletedIds);
                        setCheckedPendingIds(new Set());
                        setIsFileListCollapsed(false);
                      }}
                      disabled={previewMutation.isPending || checkedPendingIds.size === 0}
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
                          Add ({checkedPendingIds.size}개 파일 추가)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Add된 파일 (토글 내부) - Add 버튼 아래에 배치 */}
                {addedFiles.length > 0 && (
                  <>
                    <button
                      onClick={() => setIsFileListCollapsed(!isFileListCollapsed)}
                      className="w-full flex items-center justify-between py-[8px] hover:bg-gray-50 rounded-[8px] px-[4px] transition-colors"
                    >
                      <h3 className="font-title-small text-[var(--color-text-primary)]">
                        추가된 파일 ({addedFiles.length})
                      </h3>
                      <svg
                        className={`w-[20px] h-[20px] text-gray-500 transition-transform ${isFileListCollapsed ? '' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {!isFileListCollapsed && (
                      <div className="space-y-[6px] max-h-[300px] overflow-y-auto">
                        {addedFiles.map((file) => (
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
                      </div>
                    )}
                  </>
                )}

                {/* AI001 에러 시 다시 시도 UI */}
                {previewMutation.isError &&
                  (previewMutation.error as AxiosError<ErrorResponse>)?.response?.data?.code === 'AI001' && (
                  <div className="flex items-center gap-[12px] px-[16px] py-[12px] bg-red-50 rounded-[10px] border border-red-200">
                    <svg className="w-[18px] h-[18px] text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="flex-1 font-body-small text-red-700">
                      AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.
                    </p>
                    <button
                      onClick={() => callPreview(allCompletedFileIds)}
                      className="px-[12px] py-[6px] rounded-[8px] bg-white border border-red-200 font-title-xsmall text-red-600 hover:bg-red-100 transition-colors flex items-center gap-[6px] flex-shrink-0"
                    >
                      <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      다시 시도
                    </button>
                  </div>
                )}
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
                slotHints={previewMutation.data?.slot_hint || []}
                fileIdToName={fileIdToName}
                isLoading={previewMutation.isPending}
              />
            </div>
            {/* 최종 제출 버튼 */}
            <div className="px-[20px] pb-[20px]">
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
          </div>
        </div>

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

        {/* 하단 네비게이션 */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(`/diagnostics/${diagnosticId}`)}
            className="flex items-center gap-[4px] px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            기안 상세로 돌아가기
          </button>
        </div>
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
