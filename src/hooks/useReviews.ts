import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as reviewsApi from '../api/reviews';
import type { ReviewListParams, SubmitReviewData } from '../api/reviews';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

export const useReviewsDashboard = (domainCode?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.REVIEWS.DASHBOARD, domainCode],
    queryFn: () => reviewsApi.getReviewsDashboard(domainCode),
  });
};

export const useReviews = (params?: ReviewListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.LIST(params),
    queryFn: () => reviewsApi.getReviews(params),
    enabled: !!params,
  });
};

export const useReviewDetail = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.DETAIL(id),
    queryFn: () => reviewsApi.getReviewDetail(id),
    enabled: id > 0,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubmitReviewData }) =>
      reviewsApi.submitReview(id, data),
    onSuccess: () => {
      toast.success('심사 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: reviewsApi.generateReport,
    onSuccess: () => {
      toast.success('리포트 생성이 요청되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useBulkReport = () => {
  return useMutation({
    mutationFn: reviewsApi.bulkReport,
    onSuccess: () => {
      toast.success('일괄 리포트 생성이 요청되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useExportReviews = () => {
  return useMutation({
    mutationFn: ({ format, reviewIds }: { format: 'EXCEL' | 'CSV'; reviewIds: number[] }) =>
      reviewsApi.exportReviews(format, reviewIds),
    onSuccess: (blob, { format }) => {
      const ext = format === 'CSV' ? 'csv' : 'xlsx';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviews_export.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('파일이 다운로드되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
