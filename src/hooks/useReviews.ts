import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as reviewsApi from '../api/reviews';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse, ReviewStatus } from '../types/api.types';

interface ReviewListParams {
  domainCode?: string;
  status?: ReviewStatus;
  page?: number;
  size?: number;
}

export const useReviewsDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.DASHBOARD,
    queryFn: reviewsApi.getReviewsDashboard,
  });
};

export const useReviews = (params?: ReviewListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.LIST(params),
    queryFn: () => reviewsApi.getReviews(params),
  });
};

export const useReviewDetail = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.DETAIL(id),
    queryFn: () => reviewsApi.getReviewDetail(id),
    enabled: id > 0,
  });
};

export const useProcessReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { decision: 'APPROVED' | 'REVISION_REQUIRED'; comment?: string } }) =>
      reviewsApi.processReview(id, data),
    onSuccess: () => {
      toast.success('심사 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
      toast.success('보고서가 생성되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useExportReviews = () => {
  return useMutation({
    mutationFn: reviewsApi.exportReviews,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reviews_export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
