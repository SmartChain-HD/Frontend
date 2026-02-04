import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ErrorResponse, AccountLockData } from '../types/api.types';
import { ERROR_HANDLERS, LOGIN_ERROR_MESSAGES } from '../constants/errorCodes';

/** 계정 잠금 상태 */
export interface AccountLockState {
  isLocked: boolean;
  isPermanent: boolean;
  lockedUntil?: Date;
  remainingMinutes?: number;
  message: string;
}

/**
 * 에러 응답에서 계정 잠금 상태 추출
 */
export const getAccountLockState = (error: AxiosError<ErrorResponse>): AccountLockState | null => {
  const errorData = error.response?.data;
  const errorCode = errorData?.code;

  if (errorCode === 'A005') {
    return {
      isLocked: true,
      isPermanent: true,
      message: LOGIN_ERROR_MESSAGES.A005,
    };
  }

  if (errorCode === 'A006') {
    const lockData = errorData?.data as AccountLockData | undefined;
    return {
      isLocked: true,
      isPermanent: false,
      lockedUntil: lockData?.lockedUntil ? new Date(lockData.lockedUntil) : undefined,
      remainingMinutes: lockData?.remainingMinutes,
      message: LOGIN_ERROR_MESSAGES.A006,
    };
  }

  return null;
};

/**
 * 남은 잠금 시간 포맷팅
 */
export const formatLockTime = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  return `${minutes}분`;
};

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
      if (handler.customMessage) {
        toast.error(handler.customMessage);
      }
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
