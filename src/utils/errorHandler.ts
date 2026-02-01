import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ErrorResponse } from '../types/api.types';
import { ERROR_HANDLERS, LOGIN_ERROR_MESSAGES } from '../constants/errorCodes';

export const handleApiError = (error: AxiosError<ErrorResponse>): void => {
  const errorData = error.response?.data;
  const errorCode = errorData?.code || 'UNKNOWN';
  const errorMessage = errorData?.message || '알 수 없는 오류가 발생했습니다';

  const handler = ERROR_HANDLERS[errorCode] || { action: 'toast' as const };

  switch (handler.action) {
    case 'toast':
      toast.error(handler.customMessage || errorMessage);
      break;
    case 'redirect':
      window.location.href = handler.redirectTo || '/';
      break;
    case 'silent':
      console.error(`[${errorCode}] ${errorMessage}`);
      break;
  }
};

/**
 * 로그인 에러에서 사용자 친화적 메시지를 반환
 */
export const getLoginErrorMessage = (error: AxiosError<ErrorResponse>): string => {
  // 네트워크 오류 체크 (응답 없음)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return LOGIN_ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.code === 'ECONNABORTED') {
      return LOGIN_ERROR_MESSAGES.ECONNABORTED;
    }
    return LOGIN_ERROR_MESSAGES.NETWORK_ERROR;
  }

  const errorData = error.response.data;
  const errorCode = errorData?.code;
  const httpStatus = error.response.status;

  // 에러 코드로 메시지 매핑
  if (errorCode && LOGIN_ERROR_MESSAGES[errorCode]) {
    return LOGIN_ERROR_MESSAGES[errorCode];
  }

  // HTTP 상태 코드 기반 기본 메시지
  if (httpStatus === 401) {
    return LOGIN_ERROR_MESSAGES.A003;
  }
  if (httpStatus === 404) {
    return LOGIN_ERROR_MESSAGES.U003;
  }
  if (httpStatus >= 500) {
    return LOGIN_ERROR_MESSAGES.S001;
  }

  // 서버에서 제공한 메시지 사용 (fallback)
  if (errorData?.message) {
    return errorData.message;
  }

  return LOGIN_ERROR_MESSAGES.UNKNOWN;
};
