import { apiClient } from './client';
import type { BaseResponse, PagedData, ReviewStatus } from '../types/api.types';

export interface ReviewDashboardResponse {
  totalCompanies: number;
  notSubmitted: number;
  reviewing: number;
  revisionRequired: number;
  completed: number;
}

export interface ReviewListItem {
  reviewId: number;
  diagnosticId: number;
  title: string;
  domainCode: string;
  companyName: string;
  submittedAt: string;
  status: ReviewStatus;
  riskLevel?: string;
}

export interface ReviewDetail extends ReviewListItem {
  aiVerdict?: string;
  whySummary?: string;
  comment?: string;
}

interface ReviewListParams {
  domainCode?: string;
  status?: ReviewStatus;
  page?: number;
  size?: number;
}

export const getReviewsDashboard = async (): Promise<ReviewDashboardResponse> => {
  const response = await apiClient.get<BaseResponse<ReviewDashboardResponse>>('/v1/reviews/dashboard');
  return response.data.data;
};

export const getReviews = async (
  params: ReviewListParams = {}
): Promise<PagedData<ReviewListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<ReviewListItem>>>('/v1/reviews', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getReviewDetail = async (id: number): Promise<ReviewDetail> => {
  const response = await apiClient.get<BaseResponse<ReviewDetail>>(`/v1/reviews/${id}`);
  return response.data.data;
};

export const processReview = async (
  id: number,
  data: { decision: 'APPROVED' | 'REVISION_REQUIRED'; comment?: string }
): Promise<void> => {
  await apiClient.patch(`/v1/reviews/${id}`, data);
};

export const generateReport = async (id: number): Promise<void> => {
  await apiClient.post(`/v1/reviews/${id}/report`);
};

export const bulkReport = async (ids: number[]): Promise<void> => {
  await apiClient.post('/v1/reviews/bulk-report', { reviewIds: ids });
};

export const exportReviews = async (params?: ReviewListParams): Promise<Blob> => {
  const response = await apiClient.post('/v1/reviews/export', params, {
    responseType: 'blob',
  });
  return response.data;
};
