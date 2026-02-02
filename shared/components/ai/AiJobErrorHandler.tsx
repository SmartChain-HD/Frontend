import { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../src/types/api.types';
import {
  getAiErrorMessage,
  getAiErrorType,
  type AiErrorType,
} from '../../../src/constants/errorCodes';

interface AiJobErrorHandlerProps {
  error: AxiosError<ErrorResponse> | Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  showRetry: boolean;
  containerClass: string;
}

const getErrorConfig = (errorType: AiErrorType, errorMessage: string): ErrorConfig => {
  switch (errorType) {
    case 'SERVICE_UNAVAILABLE':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        title: 'AI 서비스 점검 중',
        description: '현재 AI 서비스가 점검 중입니다. 잠시 후 다시 시도해주세요.',
        showRetry: true,
        containerClass: 'bg-orange-50 border-orange-200',
      };

    case 'ANALYSIS_ERROR':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        title: '분석 중 오류 발생',
        description: 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        showRetry: true,
        containerClass: 'bg-red-50 border-red-200',
      };

    case 'BAD_REQUEST':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '요청 형식 오류',
        description: '요청 데이터에 문제가 있습니다. 입력 값을 확인해주세요.',
        showRetry: false,
        containerClass: 'bg-yellow-50 border-yellow-200',
      };

    case 'MISSING_SLOTS':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        title: '필수 항목 누락',
        description: 'AI 분석을 위한 필수 항목이 제출되지 않았습니다. 필수 항목을 모두 제출해주세요.',
        showRetry: false,
        containerClass: 'bg-amber-50 border-amber-200',
      };

    case 'TIMEOUT':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '분석 시간 초과',
        description: '분석 요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.',
        showRetry: true,
        containerClass: 'bg-gray-50 border-gray-200',
      };

    case 'NETWORK':
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        ),
        title: '네트워크 연결 오류',
        description: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        showRetry: true,
        containerClass: 'bg-gray-50 border-gray-200',
      };

    default:
      return {
        icon: (
          <svg className="w-[48px] h-[48px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: errorMessage || '오류 발생',
        description: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
        showRetry: true,
        containerClass: 'bg-gray-50 border-gray-200',
      };
  }
};

export function AiJobErrorHandler({ error, onRetry, isRetrying = false }: AiJobErrorHandlerProps) {
  if (!error) return null;

  const isAxiosError = (err: unknown): err is AxiosError<ErrorResponse> => {
    return (err as AxiosError).isAxiosError === true;
  };

  let errorCode: string | undefined;
  let httpStatus: number | undefined;

  if (isAxiosError(error)) {
    errorCode = error.response?.data?.code || error.code;
    httpStatus = error.response?.status;
  }

  const errorMessage = getAiErrorMessage(errorCode);
  const errorType = getAiErrorType(errorCode, httpStatus);
  const config = getErrorConfig(errorType, errorMessage);

  return (
    <div className={`rounded-[12px] border p-[24px] ${config.containerClass}`}>
      <div className="flex flex-col items-center text-center gap-[16px]">
        {config.icon}
        <div className="space-y-[8px]">
          <h3 className="font-title-medium text-[var(--color-text-primary)]">
            {config.title}
          </h3>
          <p className="font-body-medium text-[var(--color-text-secondary)]">
            {config.description}
          </p>
        </div>

        {config.showRetry && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-[8px] px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
          >
            {isRetrying ? (
              <>
                <span className="w-[16px] h-[16px] border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                재시도 중...
              </>
            ) : (
              <>
                <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 시도
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function AiServiceFallback({ onRetry, isRetrying = false }: { onRetry?: () => void; isRetrying?: boolean }) {
  return (
    <div className="rounded-[12px] border border-orange-200 bg-orange-50 p-[32px]">
      <div className="flex flex-col items-center text-center gap-[20px]">
        <div className="w-[64px] h-[64px] rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-[32px] h-[32px] text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <div className="space-y-[8px]">
          <h3 className="font-title-large text-[var(--color-text-primary)]">
            AI 서비스 일시 중단
          </h3>
          <p className="font-body-medium text-[var(--color-text-secondary)] max-w-[400px]">
            현재 AI 분석 서비스가 점검 중입니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="flex items-center gap-[8px] text-[var(--color-text-tertiary)]">
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-body-small">서비스 복구 작업 중</span>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-[8px] px-[24px] py-[12px] rounded-[8px] border border-[var(--color-border-default)] bg-white text-[var(--color-text-primary)] font-title-small hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
          >
            {isRetrying ? (
              <>
                <span className="w-[16px] h-[16px] border-[2px] border-gray-400 border-t-transparent rounded-full animate-spin" />
                확인 중...
              </>
            ) : (
              <>
                <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                서비스 상태 확인
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
