import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../shared/layout/DashboardLayout';
import {
  ArrowLeft,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
} from 'lucide-react';
import { useDiagnosticFiles } from '../../src/hooks/useFiles';
import { useChatSend } from '../../src/hooks/useChat';
import { getDownloadUrl, fetchFileBlob } from '../../src/api/files';
import type { EvidenceFile, DownloadUrlResponse } from '../../src/api/files';
import type { ChatMessage, SourceItem } from '../../src/api/chat';

// ============================================
// Types
// ============================================

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  confidence?: 'high' | 'medium' | 'low';
  sources?: SourceItem[];
  attachedFileName?: string;
}

interface FileSession {
  messages: DisplayMessage[];
  sessionId?: string;
}

// ============================================
// Helpers
// ============================================

function getFileExt(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function isImage(fileName: string): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(getFileExt(fileName));
}

function isPdf(fileName: string): boolean {
  return getFileExt(fileName) === 'pdf';
}

function isSpreadsheet(fileName: string): boolean {
  return ['xlsx', 'xls', 'csv'].includes(getFileExt(fileName));
}

// ============================================
// Constants
// ============================================

const confidenceColors: Record<string, string> = {
  high: 'bg-[#f0fdf4] text-[#008233] border-[#bbf7d0]',
  medium: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
  low: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

const confidenceLabels: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// ============================================
// Main Component
// ============================================

export default function AiAnalysisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosticId = Number(searchParams.get('diagnosticId')) || 0;
  const domain = (searchParams.get('domain') || 'compliance') as 'safety' | 'compliance' | 'esg' | 'all';

  // Hide reCAPTCHA badge on this page
  useEffect(() => {
    const badge = document.querySelector('.grecaptcha-badge') as HTMLElement | null;
    if (badge) badge.style.visibility = 'hidden';
    return () => { if (badge) badge.style.visibility = 'visible'; };
  }, []);

  // File state
  const { data: files = [] } = useDiagnosticFiles(diagnosticId);
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [fileDownload, setFileDownload] = useState<DownloadUrlResponse | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingFileUrl, setLoadingFileUrl] = useState(false);
  const [sheetHtml, setSheetHtml] = useState<string | null>(null);

  // Chat state (per-file sessions)
  const fileSessionsRef = useRef<Map<number, FileSession>>(new Map());
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const chatSend = useChatSend();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  // Load file download info when selected file changes
  useEffect(() => {
    if (!selectedFile) {
      setFileDownload(null);
      setBlobUrl(null);
      setSheetHtml(null);
      return;
    }
    let cancelled = false;
    setLoadingFileUrl(true);
    setSheetHtml(null);

    getDownloadUrl(selectedFile.fileId)
      .then(async (data) => {
        if (cancelled) return;
        setFileDownload(data);

        // xlsx/xls/csv → fetch via apiClient & parse with sheetjs
        if (isSpreadsheet(data.fileName)) {
          const url = await fetchFileBlob(data.downloadUrl);
          if (cancelled) { URL.revokeObjectURL(url); return; }
          setBlobUrl(url);
          const resp = await fetch(url);
          const buf = await resp.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const html = XLSX.utils.sheet_to_html(ws, { editable: false });
          if (!cancelled) setSheetHtml(html);
        } else {
          // PDF, image, etc. → fetch via apiClient as blob
          const url = await fetchFileBlob(data.downloadUrl);
          if (cancelled) { URL.revokeObjectURL(url); return; }
          setBlobUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) { setFileDownload(null); setBlobUrl(null); }
      })
      .finally(() => {
        if (!cancelled) setLoadingFileUrl(false);
      });
    return () => {
      cancelled = true;
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [selectedFile]);

  // Keep fileSessionsRef in sync with current chat state
  useEffect(() => {
    if (selectedFile) {
      fileSessionsRef.current.set(selectedFile.fileId, { messages, sessionId });
    }
  }, [messages, sessionId, selectedFile]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectFile = (file: EvidenceFile) => {
    if (file.fileId === selectedFile?.fileId) return;

    // Save current file's session
    if (selectedFile) {
      fileSessionsRef.current.set(selectedFile.fileId, { messages, sessionId });
    }

    // Restore or start fresh for the new file
    const saved = fileSessionsRef.current.get(file.fileId);
    setMessages(saved?.messages ?? []);
    setSessionId(saved?.sessionId);
    setSelectedFile(file);
  };

  const buildHistory = useCallback((): ChatMessage[] => {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatSend.isPending) return;

    const userMsg: DisplayMessage = {
      role: 'user',
      content: trimmed,
      attachedFileName: selectedFile?.fileName,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const request = {
      message: trimmed,
      domain,
      history: buildHistory(),
      session_id: sessionId,
      ...(selectedFile ? { file_id: selectedFile.fileId } : {}),
    };

    chatSend.mutate(request, {
      onSuccess: (data) => {
        if (data.session_id) setSessionId(data.session_id);
        const assistantMsg: DisplayMessage = {
          role: 'assistant',
          content: data.answer,
          confidence: data.confidence,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      },
      onError: () => {
        const errorMsg: DisplayMessage = {
          role: 'assistant',
          content: 'AI 응답을 가져오지 못했습니다. 다시 시도해주세요.',
        };
        setMessages((prev) => [...prev, errorMsg]);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout hideSidebar>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center gap-[12px] px-[24px] py-[12px] border-b border-[#dee2e6] bg-white">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-[6px] text-[#495057] hover:text-[#212529] transition-colors font-body-medium"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            결과 조회로 돌아가기
          </button>
          <div className="w-[1px] h-[20px] bg-[#dee2e6]" />
          <span className="font-title-small text-[#212529]">AI 문서 분석</span>
        </div>

        {/* Main Content: [File Tabs | Viewer | Chatbot] */}
        <div className="flex flex-1 min-h-0">
          {/* ===== LEFT: Vertical File Tabs ===== */}
          <div className="w-[220px] flex-shrink-0 border-r border-[#dee2e6] bg-[#f8f9fa] flex flex-col">
            <div className="px-[14px] py-[12px] border-b border-[#dee2e6]">
              <span className="font-title-small text-[#495057]">
                증빙파일 ({files.length})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file.fileId}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full flex items-center gap-[8px] px-[14px] py-[10px] text-left transition-colors border-l-[3px] ${
                    selectedFile?.fileId === file.fileId
                      ? 'bg-white border-l-[#003087] text-[#003087]'
                      : 'border-l-transparent text-[#495057] hover:bg-[#e9ecef]'
                  }`}
                >
                  <FileText className="w-[16px] h-[16px] flex-shrink-0" />
                  <span className="font-body-small truncate">{file.fileName}</span>
                </button>
              ))}
              {files.length === 0 && (
                <div className="px-[14px] py-[20px] font-body-small text-[#868e96] text-center">
                  파일이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* ===== CENTER: File Viewer ===== */}
          <div className="flex-1 bg-[#e9ecef] flex items-center justify-center min-h-0 min-w-0 overflow-auto">
            {loadingFileUrl ? (
              <div className="flex flex-col items-center gap-[12px] text-[#868e96]">
                <Loader2 className="w-[32px] h-[32px] animate-spin" />
                <span className="font-body-medium">파일 로딩 중...</span>
              </div>
            ) : fileDownload ? (
              <FileViewer
                fileDownload={fileDownload}
                blobUrl={blobUrl}
                sheetHtml={sheetHtml}
                fileName={selectedFile?.fileName || ''}
              />
            ) : (
              <div className="flex flex-col items-center gap-[12px] text-[#868e96]">
                <FileText className="w-[48px] h-[48px]" />
                <span className="font-body-medium">
                  {files.length > 0 ? '파일을 선택해주세요' : '등록된 파일이 없습니다'}
                </span>
              </div>
            )}
          </div>

          {/* ===== RIGHT: Chatbot ===== */}
          <div className="w-[380px] flex-shrink-0 flex flex-col bg-white border-l border-[#dee2e6]">
            {/* Chat Header */}
            <div className="px-[20px] py-[14px] border-b border-[#dee2e6]">
              <h3 className="font-title-medium text-[#212529]">AI 어시스턴트</h3>
              <p className="font-body-small text-[#868e96] mt-[2px]">
                선택한 파일 기반으로 질문하세요
              </p>
            </div>

            {/* Selected file indicator */}
            {selectedFile && (
              <div className="px-[16px] py-[8px] bg-[#e7f5ff] border-b border-[#dee2e6]">
                <span className="inline-flex items-center gap-[4px] font-body-small text-[#1971c2]">
                  <FileText className="w-[12px] h-[12px]" />
                  {selectedFile.fileName}
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-[16px] py-[16px] space-y-[16px] min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-[#868e96] gap-[12px]">
                  <div className="w-[56px] h-[56px] rounded-full bg-[#f1f3f5] flex items-center justify-center">
                    <Send className="w-[24px] h-[24px]" />
                  </div>
                  <p className="font-body-medium text-center">
                    AI에게 문서 분석을<br />요청해보세요.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}

              {chatSend.isPending && (
                <div className="flex items-start gap-[8px]">
                  <div className="w-[28px] h-[28px] rounded-full bg-[#003087] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-detail-small font-bold">AI</span>
                  </div>
                  <div className="bg-[#f1f3f5] rounded-[12px] px-[14px] py-[10px]">
                    <div className="flex gap-[4px]">
                      <span className="w-[6px] h-[6px] bg-[#868e96] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-[6px] h-[6px] bg-[#868e96] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-[6px] h-[6px] bg-[#868e96] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#dee2e6] px-[12px] py-[10px]">
              <div className="flex items-end gap-[8px]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="질문을 입력하세요..."
                  rows={1}
                  className="flex-1 resize-none border border-[#dee2e6] rounded-[10px] px-[12px] py-[10px] font-body-medium focus:outline-none focus:border-[#003087] max-h-[120px]"
                  style={{ minHeight: '40px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatSend.isPending}
                  className="p-[10px] bg-[#003087] text-white rounded-[10px] hover:bg-[#002554] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// Sub-components
// ============================================

function FileViewer({
  fileDownload,
  blobUrl,
  sheetHtml,
  fileName,
}: {
  fileDownload: DownloadUrlResponse;
  blobUrl: string | null;
  sheetHtml: string | null;
  fileName: string;
}) {
  const name = fileDownload.fileName || fileName;
  const viewUrl = blobUrl || fileDownload.downloadUrl;

  // PDF
  if (isPdf(name)) {
    return (
      <iframe
        src={viewUrl}
        className="w-full h-full border-none"
        title={name}
      />
    );
  }

  // Image
  if (isImage(name)) {
    return (
      <div className="p-[24px] flex items-center justify-center w-full h-full">
        <img
          src={viewUrl}
          alt={name}
          className="max-w-full max-h-full object-contain rounded-[8px]"
        />
      </div>
    );
  }

  // Spreadsheet (xlsx/xls/csv)
  if (isSpreadsheet(name) && sheetHtml) {
    return (
      <div
        className="w-full h-full overflow-auto bg-white p-[16px] sheet-viewer"
        dangerouslySetInnerHTML={{ __html: sheetHtml }}
        style={{
          // sheetjs 테이블 기본 스타일링
          // @ts-expect-error CSS custom property
          '--sheet-border': '#dee2e6',
        }}
      />
    );
  }

  // Fallback: download
  return (
    <div className="flex flex-col items-center gap-[16px] text-[#868e96]">
      <FileText className="w-[48px] h-[48px]" />
      <span className="font-body-medium">{name}</span>
      <span className="font-body-small">이 파일 형식은 미리보기를 지원하지 않습니다.</span>
      <a
        href={viewUrl}
        download={name}
        className="flex items-center gap-[6px] px-[20px] py-[10px] bg-[#003087] text-white rounded-[8px] font-title-small hover:bg-[#002554] transition-colors"
      >
        <Download className="w-[16px] h-[16px]" />
        파일 다운로드
      </a>
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-[8px] ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-[28px] h-[28px] rounded-full bg-[#495057] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-detail-small font-bold">U</span>
        </div>
      ) : (
        <div className="w-[28px] h-[28px] rounded-full bg-[#003087] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-detail-small font-bold">AI</span>
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Attached file indicator */}
        {message.attachedFileName && (
          <div className="flex items-center gap-[4px] mb-[4px]">
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] bg-[#e7f5ff] text-[#1971c2] rounded font-detail-small">
              <FileText className="w-[10px] h-[10px]" />
              {message.attachedFileName}
            </span>
          </div>
        )}

        <div
          className={`rounded-[12px] px-[14px] py-[10px] ${
            isUser
              ? 'bg-[#003087] text-white'
              : 'bg-[#f1f3f5] text-[#212529]'
          }`}
        >
          <p className="font-body-medium whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Confidence badge — 제거됨 */}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-[6px]">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-[4px] text-[#868e96] hover:text-[#495057] font-body-small transition-colors"
            >
              {showSources ? <ChevronUp className="w-[14px] h-[14px]" /> : <ChevronDown className="w-[14px] h-[14px]" />}
              출처 ({message.sources.length})
            </button>
            {showSources && (
              <div className="mt-[6px] space-y-[6px]">
                {message.sources.map((source, i) => (
                  <SourceCard key={i} source={source} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: SourceItem }) {
  const scorePercent = Math.round(source.score * 100);

  return (
    <div className="bg-white border border-[#dee2e6] rounded-[8px] p-[10px]">
      <div className="flex items-center justify-between mb-[4px]">
        <span className="font-title-xsmall text-[#212529]">{source.title}</span>
        <span className="font-detail-small text-[#868e96]">{scorePercent}%</span>
      </div>
      {source.snippet && (
        <p className="font-body-small text-[#495057] line-clamp-2">{source.snippet}</p>
      )}
      <div className="flex items-center gap-[8px] mt-[4px] font-detail-small text-[#868e96]">
        <span>{source.type}</span>
        {source.loc.page && <span>p.{source.loc.page}</span>}
      </div>
    </div>
  );
}
