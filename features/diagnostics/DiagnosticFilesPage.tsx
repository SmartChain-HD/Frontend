import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiagnosticDetail } from '../../src/hooks/useDiagnostics';
import { useUploadFile, useDiagnosticFiles, useParsingResult, useDeleteFile } from '../../src/hooks/useFiles';
import * as filesApi from '../../src/api/files';
import type { ParsingStatus } from '../../src/api/files';
import DashboardLayout from '../../shared/layout/DashboardLayout';

interface FileItem {
  id: number;
  name: string;
  parsingStatus: ParsingStatus;
  fileSize?: number;
}

const PARSING_STATUS_LABELS: Record<ParsingStatus, string> = {
  WAITING: '대기중',
  PROCESSING: '분석중',
  SUCCESS: '완료',
  FAILED: '실패',
};

const PARSING_STATUS_STYLES: Record<ParsingStatus, string> = {
  WAITING: 'bg-gray-100 text-gray-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function DiagnosticFilesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const diagnosticId = Number(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: diagnostic, isLoading: isDiagnosticLoading } = useDiagnosticDetail(diagnosticId);
  const { data: serverFiles } = useDiagnosticFiles(diagnosticId);
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();

  const [localFiles, setLocalFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  // 서버에서 가져온 파일 목록을 반영
  useEffect(() => {
    if (serverFiles) {
      setLocalFiles(serverFiles.map((f) => ({
        id: f.fileId,
        name: f.fileName,
        parsingStatus: f.parsingStatus,
        fileSize: f.fileSize,
      })));
    }
  }, [serverFiles]);

  // 진단 상태가 WRITING 또는 RETURNED일 때만 업로드/삭제 가능
  const canEdit = diagnostic?.status === 'WRITING' || diagnostic?.status === 'RETURNED';

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
    if (!canEdit) return;
    const files = Array.from(e.dataTransfer.files);
    handleFilesUpload(files);
  }, [canEdit]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFilesUpload(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const result = await uploadMutation.mutateAsync({ diagnosticId, file });
        setLocalFiles(prev => [
          ...prev,
          {
            id: result.fileId,
            name: result.originalFileName || result.fileName,
            parsingStatus: 'WAITING',
          },
        ]);
      } catch {
        // Error handled by mutation (toast)
      }
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteMutation.mutateAsync(fileId);
      setLocalFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    } catch {
      // Error handled by mutation (toast)
    }
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      const url = await filesApi.getDownloadUrl(fileId);
      window.open(url, '_blank');
    } catch {
      // Error will be handled
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
        <div>
          <h1 className="font-heading-small text-[var(--color-text-primary)]">파일 업로드</h1>
          <p className="font-body-medium text-[var(--color-text-tertiary)] mt-[8px]">
            {diagnostic.campaign?.title || diagnostic.diagnosticCode}
          </p>
        </div>

        {/* 제출됨 이후 상태에서는 읽기 전용 안내 */}
        {!canEdit && (
          <div className="bg-yellow-50 rounded-[12px] p-[16px] flex gap-[12px]">
            <div className="w-[20px] h-[20px] rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-[2px]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="font-body-medium text-yellow-800">
              현재 진단 상태({diagnostic.statusLabel || diagnostic.status})에서는 파일 업로드/삭제가 불가합니다.
            </p>
          </div>
        )}

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

            {/* 드래그 앤 드롭 영역 — canEdit일 때만 활성화 */}
            {canEdit && (
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
            )}

            {/* 업로드된 파일 목록 */}
            {localFiles.length > 0 && (
              <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
                <div className="px-[16px] py-[12px] border-b border-[var(--color-border-default)] bg-gray-50">
                  <h3 className="font-title-small text-[var(--color-text-primary)]">
                    업로드된 파일 ({localFiles.length})
                  </h3>
                </div>
                <div className="divide-y divide-[var(--color-border-default)]">
                  {localFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`px-[16px] py-[14px] flex items-center gap-[12px] cursor-pointer transition-colors ${
                        selectedFileId === file.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => file.parsingStatus === 'SUCCESS' && setSelectedFileId(file.id)}
                    >
                      {/* 파일 아이콘 */}
                      <div className="w-[40px] h-[40px] rounded-[8px] bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-[20px] h-[20px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* 파일 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body-medium text-[var(--color-text-primary)] truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-[8px] mt-[4px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-full text-xs font-medium ${PARSING_STATUS_STYLES[file.parsingStatus]}`}>
                            {PARSING_STATUS_LABELS[file.parsingStatus]}
                          </span>
                        </div>
                      </div>

                      {/* 진행률 바 */}
                      {(file.parsingStatus === 'WAITING' || file.parsingStatus === 'PROCESSING') && (
                        <div className="w-[100px] h-[4px] bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary-main)] transition-all"
                            style={{ width: `${file.parsingStatus === 'WAITING' ? 10 : 50}%` }}
                          />
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-[8px]">
                        {file.parsingStatus === 'SUCCESS' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadFile(file.id); }}
                            className="p-[8px] rounded-[6px] hover:bg-gray-200 transition-colors"
                            title="다운로드"
                          >
                            <svg className="w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                            disabled={deleteMutation.isPending}
                            className="p-[8px] rounded-[6px] hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            <svg className="w-[18px] h-[18px] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 업로드 중 표시 */}
            {uploadMutation.isPending && (
              <div className="flex items-center gap-[12px] p-[16px] bg-blue-50 rounded-[12px]">
                <div className="w-[24px] h-[24px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                <span className="font-body-medium text-[var(--color-primary-main)]">
                  파일 업로드 중...
                </span>
              </div>
            )}
          </div>

          {/* 우측: 파싱 결과 */}
          <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] h-fit">
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
                    파일을 선택하면 파싱 결과가 표시됩니다
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
