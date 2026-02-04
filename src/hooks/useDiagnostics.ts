import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as diagnosticsApi from '../api/diagnostics';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse, DiagnosticStatus } from '../types/api.types';

interface DiagnosticsListParams {
  domainCode?: string;
  status?: DiagnosticStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export const useDiagnosticsList = (params?: DiagnosticsListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.DIAGNOSTICS.LIST(params),
    queryFn: () => diagnosticsApi.getDiagnostics(params),
  });
};

export const useDiagnosticDetail = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.DIAGNOSTICS.DETAIL(id),
    queryFn: () => diagnosticsApi.getDiagnosticDetail(id),
    enabled: id > 0,
  });
};

export const useCreateDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagnosticsApi.createDiagnostic,
    onSuccess: () => {
      toast.success('기안이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useSubmitDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: diagnosticsApi.DiagnosticSubmitRequest;
    }) => diagnosticsApi.submitDiagnostic(id, data),
    onSuccess: () => {
      toast.success('기안이 제출되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useDiagnosticHistory = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.DIAGNOSTICS.HISTORY(id),
    queryFn: () => diagnosticsApi.getDiagnosticHistory(id),
    enabled: id > 0,
  });
};

export const useDeleteDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagnosticsApi.deleteDiagnostic,
    onSuccess: () => {
      toast.success('기안이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
