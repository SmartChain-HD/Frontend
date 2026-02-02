import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as aiJobsApi from '../api/aiJobs';
import type { JobDetail } from '../api/aiJobs';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { ErrorResponse } from '../types/api.types';
import { getAiErrorMessage, getAiErrorType } from '../constants/errorCodes';

const AI_JOB_TIMEOUT_MS = 120000;
const AI_JOB_POLL_INTERVAL = 5000;
const AI_JOB_MAX_RETRIES = 3;

export interface AiJobError {
  code: string;
  message: string;
  type: ReturnType<typeof getAiErrorType>;
  isRetryable: boolean;
}

export const parseAiJobError = (error: AxiosError<ErrorResponse>): AiJobError => {
  const errorCode = error.response?.data?.code || error.code || 'UNKNOWN';
  const httpStatus = error.response?.status;
  const errorType = getAiErrorType(errorCode, httpStatus);

  const isRetryable =
    errorType === 'SERVICE_UNAVAILABLE' ||
    errorType === 'TIMEOUT' ||
    errorType === 'NETWORK' ||
    errorType === 'ANALYSIS_ERROR';

  return {
    code: errorCode,
    message: getAiErrorMessage(errorCode),
    type: errorType,
    isRetryable,
  };
};

export const useJobStatus = (jobId: string | null, options?: { timeout?: number }) => {
  const timeout = options?.timeout ?? AI_JOB_TIMEOUT_MS;

  return useQuery({
    queryKey: QUERY_KEYS.JOBS.STATUS(jobId ?? ''),
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const result = await aiJobsApi.getJobStatus(jobId!);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
          const timeoutError = new Error('AI_TIMEOUT') as AxiosError<ErrorResponse>;
          timeoutError.code = 'ECONNABORTED';
          throw timeoutError;
        }
        throw error;
      }
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'SUCCEEDED' || status === 'FAILED') {
        return false;
      }
      return AI_JOB_POLL_INTERVAL;
    },
    retry: (failureCount, error) => {
      const axiosError = error as AxiosError<ErrorResponse>;
      const parsedError = parseAiJobError(axiosError);
      return parsedError.isRetryable && failureCount < AI_JOB_MAX_RETRIES;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => aiJobsApi.retryJob(jobId),
    onSuccess: (_data: JobDetail, jobId: string) => {
      toast.success('작업 재시도가 요청되었습니다.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.STATUS(jobId) });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const parsedError = parseAiJobError(error);
      toast.error(parsedError.message || '작업 재시도에 실패했습니다.');
      console.error('Job retry failed:', error);
    },
  });
};

export const useAiServiceHealth = () => {
  return useQuery({
    queryKey: ['ai', 'health'],
    queryFn: async () => {
      try {
        await aiJobsApi.getJobStatus('health-check');
        return { available: true };
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.status === 404) {
          return { available: true };
        }
        if (axiosError.response?.status === 503 || !axiosError.response) {
          return { available: false };
        }
        return { available: true };
      }
    },
    staleTime: 30000,
    retry: false,
  });
};
