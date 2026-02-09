import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { useUploadFile, useDeleteFile } from '../../src/hooks/useFiles';
import { useJobPolling } from '../../src/hooks/useJobs';
import type { JobStatus } from '../../src/api/jobs';
import { FileText, Image as ImageIcon, Upload, X, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

interface UploadedFile {
  id: number;
  name: string;
  jobId: string;
  status: JobStatus;
  progress?: number;
}

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: '대기중',
  RUNNING: '분석중',
  SUCCEEDED: '완료',
  FAILED: '실패',
};

const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  SUCCEEDED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

const requiredFiles = [
  'TBM 활동일지',
  '현장 안전 사진',
  '위험성평가 결과서',
  '안전교육 일지',
  '비상연락망',
];

export default function FileUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosticId = searchParams.get('diagnosticId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Job polling for files in progress
  const activeJobId = uploadedFiles.find(f => f.status === 'PENDING' || f.status === 'RUNNING')?.jobId || null;
  const { data: jobStatus } = useJobPolling(activeJobId);

  // Update file status when job status changes
  if (jobStatus && activeJobId) {
    const fileIndex = uploadedFiles.findIndex(f => f.jobId === activeJobId);
    if (fileIndex !== -1 && uploadedFiles[fileIndex].status !== jobStatus.status) {
      setUploadedFiles(prev =>
        prev.map(f => f.jobId === activeJobId
          ? { ...f, status: jobStatus.status, progress: jobStatus.progress }
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
  }, [diagnosticId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFilesUpload(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    if (!diagnosticId) {
      alert('기안 정보가 없습니다. 다시 시도해주세요.');
      return;
    }

    for (const file of files) {
      try {
        const result = await uploadMutation.mutateAsync({
          diagnosticId: Number(diagnosticId),
          file
        });
        setUploadedFiles(prev => [
          ...prev,
          {
            id: result.fileId,
            name: result.originalFileName || result.fileName,
            jobId: result.jobId,
            status: 'PENDING',
          },
        ]);
      } catch {
        toast.error(`"${file.name}" 업로드에 실패했습니다.`);
      }
    }
  };

  const handleRemoveFile = async (fileId: number) => {
    try {
      await deleteMutation.mutateAsync(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      toast.error('파일 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = () => {
    if (diagnosticId) {
      navigate(`/diagnostics/${diagnosticId}`);
    } else {
      navigate('/diagnostics');
    }
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return ImageIcon;
    }
    return FileText;
  };

  // diagnosticId가 없으면 에러 표시
  if (!diagnosticId) {
    return (
      <DashboardLayout>
        <div className="p-[32px]">
          <div className="max-w-[1468px] mx-auto">
            <div className="bg-white rounded-[20px] p-[44px] text-center">
              <p className="font-body-medium text-red-500 mb-[16px]">
                기안 정보가 없습니다.
              </p>
              <button
                onClick={() => navigate('/diagnostics/new')}
                className="bg-[#003087] text-white px-[24px] py-[12px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
              >
                새 기안 생성하기
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-[32px]">
        <div className="max-w-[1468px] mx-auto">
          {/* Page Title */}
          <h1 className="font-heading-medium text-[#212529] mb-[24px]">파일 업로드</h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-[24px]">
            {/* Left: Upload Area */}
            <div className="bg-white rounded-[20px] p-[44px]">
              {/* Guide */}
              <div className="bg-[#e3f2fd] rounded-[12px] p-[16px] mb-[24px] flex gap-[12px]">
                <div className="w-[20px] h-[20px] rounded-full bg-[#003087] flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <span className="text-white font-detail-small">!</span>
                </div>
                <div>
                  <p className="font-title-small text-[#002554] mb-[8px]">
                    파일명 가이드:
                  </p>
                  <p className="font-body-small text-[#495057]">
                    날짜_협력사명_자료명 (예: 20260109_ABC건설_TBM일지.pdf)
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUploadArea}
                className={`border-2 border-dashed rounded-[12px] p-[48px] text-center mb-[32px] transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#003087] bg-[#e3f2fd]'
                    : 'border-[#dee2e6] hover:border-[#adb5bd] hover:bg-[#f8f9fa]'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-[48px] h-[48px] text-[#adb5bd] mb-[16px]" />
                  <p className="font-title-medium text-[#212529] mb-[8px]">
                    여기에 파일을 놓거나 클릭하여 업로드
                  </p>
                  <p className="font-body-small text-[#868e96]">
                    PDF, JPG, PNG, XLSX, DOC 파일을 업로드할 수 있습니다 (최대 50MB)
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadMutation.isPending && (
                <div className="flex items-center gap-[12px] p-[16px] bg-blue-50 rounded-[12px] mb-[24px]">
                  <Loader2 className="w-[24px] h-[24px] text-[#003087] animate-spin" />
                  <span className="font-body-medium text-[#003087]">
                    파일 업로드 중...
                  </span>
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-[12px] mb-[32px]">
                  <h3 className="font-title-small text-[#212529] mb-[12px]">
                    업로드된 파일 ({uploadedFiles.length})
                  </h3>
                  {uploadedFiles.map((file) => {
                    const Icon = getFileIcon(file.name);
                    return (
                      <div
                        key={file.id}
                        className="border border-[#dee2e6] rounded-[12px] p-[16px] flex items-center gap-[16px] hover:bg-[#f8f9fa] transition-colors"
                      >
                        <Icon className="w-[32px] h-[32px] text-[#003087] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-title-small text-[#212529] truncate mb-[4px]">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-[8px]">
                            <span className={`inline-block px-[8px] py-[2px] rounded-full text-xs font-medium ${JOB_STATUS_STYLES[file.status]}`}>
                              {JOB_STATUS_LABELS[file.status]}
                            </span>
                            {file.status === 'RUNNING' && file.progress !== undefined && (
                              <span className="font-body-small text-[#868e96]">
                                {file.progress}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar for pending/running */}
                        {(file.status === 'PENDING' || file.status === 'RUNNING') && (
                          <div className="w-[80px] h-[4px] bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#003087] transition-all"
                              style={{ width: `${file.progress || (file.status === 'PENDING' ? 10 : 50)}%` }}
                            />
                          </div>
                        )}

                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          disabled={deleteMutation.isPending}
                          className="p-[8px] hover:bg-red-50 rounded-[8px] transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-[20px] h-[20px] text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {uploadedFiles.length === 0 && !uploadMutation.isPending && (
                <div className="text-center py-[24px] text-[#868e96]">
                  <p className="font-body-medium">아직 업로드된 파일이 없습니다.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-[12px]">
                <button
                  onClick={handleClickUploadArea}
                  className="flex-1 bg-[#003087] text-white px-[24px] py-[14px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors flex items-center justify-center gap-[8px]"
                >
                  <Upload className="w-[20px] h-[20px]" />
                  파일 추가
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploadedFiles.length === 0}
                  className="flex-1 bg-[#00ad1d] text-white px-[24px] py-[14px] rounded-[8px] font-title-small hover:bg-[#008a18] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  검토 화면 이동
                </button>
              </div>
            </div>

            {/* Right: Required Files Checklist */}
            <div className="bg-[#f8f9fa] rounded-[20px] p-[32px] h-fit">
              <h2 className="font-title-large text-[#212529] mb-[24px]">
                필수 첨부 자료 리스트
              </h2>
              <div className="space-y-[12px]">
                {requiredFiles.map((requiredFile, index) => {
                  // 파일명에서 필수 자료와 매칭 확인
                  const isUploaded = uploadedFiles.some((f) =>
                    f.name.toLowerCase().includes(requiredFile.split(' ')[0].toLowerCase()) ||
                    f.name.includes('TBM') && requiredFile.includes('TBM') ||
                    f.name.includes('사진') && requiredFile.includes('사진') ||
                    f.name.includes('위험성') && requiredFile.includes('위험성') ||
                    f.name.includes('교육') && requiredFile.includes('교육') ||
                    f.name.includes('연락망') && requiredFile.includes('연락망')
                  );
                  return (
                    <div key={index} className="flex items-center gap-[12px]">
                      <div
                        className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center ${
                          isUploaded ? 'bg-[#00ad1d]' : 'bg-white border-2 border-[#dee2e6]'
                        }`}
                      >
                        {isUploaded && <CheckCircle2 className="w-[14px] h-[14px] text-white" />}
                      </div>
                      <p
                        className={`font-body-medium ${
                          isUploaded ? 'text-[#212529]' : 'text-[#868e96]'
                        }`}
                      >
                        {requiredFile}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
