import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as aiRunApi from '../api/aiRun';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

export const useAiPreview = () => {
  return useMutation({
    mutationFn: ({ diagnosticId, fileIds }: { diagnosticId: number; fileIds: number[] }) =>
      aiRunApi.previewAiRun(diagnosticId, fileIds),
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useSubmitAiRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (diagnosticId: number) => aiRunApi.submitAiRun(diagnosticId),
    onSuccess: (_, diagnosticId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_RUN.RESULT(diagnosticId) });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useAiResult = (diagnosticId: number, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.RESULT(diagnosticId),
    queryFn: () => aiRunApi.getAiResult(diagnosticId),
    enabled,
    refetchInterval: (query) => {
      if (query?.state?.error || !query?.state?.data) {
        return 5000;
      }
      return false;
    },
    retry: false,
  });
};

export const useAiResultDetail = (diagnosticId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.RESULT_DETAIL(diagnosticId),
    queryFn: () => aiRunApi.getAiResultDetail(diagnosticId),
    enabled: diagnosticId > 0,
  });
};

export const useAiHistory = (diagnosticId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.HISTORY(diagnosticId),
    queryFn: () => aiRunApi.getAiHistory(diagnosticId),
    enabled: diagnosticId > 0,
  });
};
