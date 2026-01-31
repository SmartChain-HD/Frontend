import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import { FileText, Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  size: string;
  autoTag: string;
}

const requiredFiles = [
  'TBM 활동일지',
  '현장 안전 사진',
  '위험성평가 결과서 (변수)',
  '안전교육 일지',
  '비상연락망',
];

const fileTypeIcons = {
  pdf: FileText,
  image: ImageIcon,
  document: FileText,
};

const autoTagColors = {
  'TBM 활동일지': 'bg-[#e3f2fd] text-[#002554]',
  '현장 안전 사진': 'bg-[#f0fdf4] text-[#008233]',
  '위험성평가': 'bg-[#fff3e0] text-[#e65100]',
  '안전교육': 'bg-[#fef2f2] text-[#b91c1c]',
  '비상연락망': 'bg-[#f3e5f5] text-[#7b1fa2]',
};

export default function FileUploadPage() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'ABC건설_202601_TBM일지H.pdf',
      type: 'pdf',
      size: '2.4 MB',
      autoTag: 'TBM 활동일지',
    },
    {
      id: '2',
      name: 'ABC건설_202601_현장사진.jpg',
      type: 'image',
      size: '1.8 MB',
      autoTag: '현장 안전 사진',
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // File handling logic would go here
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    // Navigate to review page
    navigate('/dashboard/safety/review/1');
  };

  const getTagColor = (tag: string): string => {
    const matchedKey = Object.keys(autoTagColors).find((key) => tag.includes(key));
    return matchedKey ? autoTagColors[matchedKey as keyof typeof autoTagColors] : 'bg-[#e3f2fd] text-[#002554]';
  };

  return (
    <DashboardLayout>
      <div className="p-[32px]">
        <div className="max-w-[1468px] mx-auto">
          {/* Page Title */}
          <h1 className="font-heading-medium text-[#212529] mb-[24px]">파일 업로드</h1>

          <div className="grid grid-cols-[1fr,340px] gap-[24px]">
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
                    협력사명_기간_자료명 (예: ABC건설_202601_TBM일지H.pdf)
                  </p>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[12px] p-[48px] text-center mb-[32px] transition-all ${
                  isDragging
                    ? 'border-[#003087] bg-[#e3f2fd]'
                    : 'border-[#dee2e6] hover:border-[#adb5bd]'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-[48px] h-[48px] text-[#adb5bd] mb-[16px]" />
                  <p className="font-title-medium text-[#212529] mb-[8px]">
                    여기에 파일을 놓거나 클릭하여 업로드
                  </p>
                  <p className="font-body-small text-[#868e96]">
                    PDF, JPG, PNG, XLSX 파일을 업로드할 수 있습니다
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              <div className="space-y-[12px] mb-[32px]">
                {uploadedFiles.map((file) => {
                  const Icon = fileTypeIcons[file.type];
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
                          <span
                            className={`inline-block px-[8px] py-[2px] rounded-[4px] font-detail-small ${getTagColor(
                              file.autoTag
                            )}`}
                          >
                            Auto-tag: {file.autoTag}
                          </span>
                          <span className="font-detail-small text-[#868e96]">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-[8px] hover:bg-[#f1f3f5] rounded-[8px] transition-colors"
                      >
                        <X className="w-[20px] h-[20px] text-[#868e96]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-[12px]">
                <button className="flex-1 bg-[#003087] text-white px-[24px] py-[14px] rounded-[8px] font-title-small hover:bg-[#002554] transition-colors flex items-center justify-center gap-[8px]">
                  <Upload className="w-[20px] h-[20px]" />
                  파일 추가
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#00ad1d] text-white px-[24px] py-[14px] rounded-[8px] font-title-small hover:bg-[#008a18] transition-colors"
                >
                  검토 화면 이동
                </button>
              </div>
            </div>

            {/* Right: Required Files Checklist */}
            <div className="bg-[#f8f9fa] rounded-[20px] p-[32px]">
              <h2 className="font-title-large text-[#212529] mb-[24px]">
                필수 첨부 자료 리스트
              </h2>
              <div className="space-y-[12px]">
                {requiredFiles.map((file, index) => {
                  const isUploaded = uploadedFiles.some((f) => f.autoTag.includes(file.split(' ')[0]));
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
                        {file}
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