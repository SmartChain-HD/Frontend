import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiagnosticDetail } from '../../src/hooks/useDiagnostics';
import { useParsingResult, useDeleteFile } from '../../src/hooks/useFiles';
import { useJobPolling, useRetryJob } from '../../src/hooks/useJobs';
import * as filesApi from '../../src/api/files';
import type { JobStatus } from '../../src/api/jobs';
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

// 상태별 스타일
const STATUS_STYLES: Record<FileUploadStatus, { bg: string; text: string; border: string }> = {
  idle: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  uploading: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  processing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  complete: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
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
}: {
  file: UploadedFile;
  onRetry: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isRetrying: boolean;
  isDeleting: boolean;
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
          <p className={`font-title-xsmall mt-[2px] ${style.text}`}>
            {statusLabel}
          </p>
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

export default function DiagnosticFilesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const diagnosticId = Number(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: diagnostic, isLoading: isDiagnosticLoading } = useDiagnosticDetail(diagnosticId);
  const deleteMutation = useDeleteFile();
  const retryMutation = useRetryJob();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Job polling for files in processing state
  const processingFile = uploadedFiles.find(f => f.uploadStatus === 'processing');
  const { data: jobStatus } = useJobPolling(processingFile?.jobId || null);

  // Update file status when job status changes
  if (jobStatus && processingFile) {
    const needsUpdate = processingFile.processingStatus !== jobStatus.status ||
                        processingFile.processingProgress !== jobStatus.progress;

    if (needsUpdate) {
      const newUploadStatus: FileUploadStatus =
        jobStatus.status === 'SUCCEEDED' ? 'complete' :
        jobStatus.status === 'FAILED' ? 'error' : 'processing';

      setUploadedFiles(prev =>
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
    }
  }

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
      setUploadedFiles(prev => [
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
            setUploadedFiles(prev =>
              prev.map(f => f.id === tempId
                ? { ...f, uploadProgress: progress }
                : f
              )
            );
          },
        });

        // Update to processing status
        setUploadedFiles(prev =>
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
        setUploadedFiles(prev =>
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
      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id
          ? { ...f, uploadStatus: 'processing', processingStatus: 'PENDING', errorMessage: undefined }
          : f
        )
      );
      try {
        await retryMutation.mutateAsync(file.jobId);
      } catch {
        setUploadedFiles(prev =>
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
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }

    try {
      await deleteMutation.mutateAsync(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    } catch {
      // Error handled by mutation
    }
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
            진단 정보를 불러올 수 없습니다.
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

  const completedCount = uploadedFiles.filter(f => f.uploadStatus === 'complete').length;
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
          진단 상세로 돌아가기
        </button>

        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading-small text-[var(--color-text-primary)]">파일 업로드</h1>
            <p className="font-body-medium text-[var(--color-text-tertiary)] mt-[8px]">
              {diagnostic.campaign?.title || diagnostic.diagnosticCode}
            </p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="flex items-center gap-[16px] text-sm">
              {completedCount > 0 && (
                <span className="flex items-center gap-[6px] text-green-600">
                  <span className="w-[8px] h-[8px] rounded-full bg-green-500" />
                  완료 {completedCount}
                </span>
              )}
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-[24px]">
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
                  />
                ))}
              </div>
            )}
          </div>

          {/* 우측: 파싱 결과 */}
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] h-fit sticky top-[24px]">
            <div className="px-[20px] py-[16px] border-b border-[var(--color-border-default)]">
              <h3 className="font-title-medium text-[var(--color-text-primary)]">
                파싱 결과
              </h3>
            </div>
            <div className="p-[20px]">
              {selectedFileId ? (
                <ParsingResultView diagnosticId={diagnosticId} fileId={selectedFileId} />
              ) : (
                <div className="text-center py-[40px]">
                  <svg className="w-[48px] h-[48px] mx-auto mb-[12px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-body-medium text-[var(--color-text-tertiary)]">
                    완료된 파일을 선택하면<br />파싱 결과가 표시됩니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
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

  return (
    <div className="space-y-[20px]">
      {/* 파일 정보 */}
      <div>
        <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">파일명</p>
        <p className="font-body-medium text-[var(--color-text-primary)]">{parsingResult.fileName}</p>
      </div>

      <div>
        <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[4px]">파싱 완료</p>
        <p className="font-body-medium text-[var(--color-text-primary)]">
          {new Date(parsingResult.parsedAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 슬롯 힌트 */}
      {parsingResult.slotHints && parsingResult.slotHints.length > 0 && (
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">감지된 항목</p>
          <div className="space-y-[8px]">
            {parsingResult.slotHints.map((hint, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-[12px] py-[8px] bg-gray-50 rounded-[8px]"
              >
                <span className="font-body-small text-[var(--color-text-primary)]">
                  {hint.slotName}
                </span>
                <span className={`font-title-xsmall ${
                  hint.confidence >= 0.8 ? 'text-green-600' :
                  hint.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(hint.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추출된 텍스트 */}
      {parsingResult.extractedText && (
        <div>
          <p className="font-title-xsmall text-[var(--color-text-tertiary)] mb-[8px]">추출된 내용</p>
          <div className="p-[12px] bg-gray-50 rounded-[8px] max-h-[200px] overflow-y-auto">
            <p className="font-body-small text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {parsingResult.extractedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
