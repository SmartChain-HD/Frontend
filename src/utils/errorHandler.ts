import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ErrorResponse } from '../types/api.types';
import { ERROR_HANDLERS } from '../constants/errorCodes';

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
