import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as filesApi from '../api/files';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ diagnosticId, file }: { diagnosticId: number; file: File }) =>
      filesApi.uploadFile(diagnosticId, file),
    onSuccess: () => {
      toast.success('파일이 업로드되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useParsingResult = (diagnosticId: number, fileId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.PARSING_RESULT(diagnosticId, fileId),
    queryFn: () => filesApi.getParsingResult(diagnosticId, fileId),
    enabled: diagnosticId > 0 && fileId > 0,
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: () => {
      toast.success('파일이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
