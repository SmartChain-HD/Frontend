import { apiClient } from './client';
import type { BaseResponse, PagedData, ReviewStatus, RiskLevel } from '../types/api.types';

export interface ReviewDashboardResponse {
  totalCompanies: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface ReviewListItem {
  reviewId: number;
  reviewIdLabel: string;
  diagnostic: {
    diagnosticId: number;
    diagnosticCode: string;
    title?: string;
  };
  company: {
    companyId: number;
    companyName: string;
    companyType: string;
  };
  domainCode: string;
  domainName: string;
  score: number | null;
  riskLevel?: RiskLevel;
  riskLevelLabel?: string;
  riskColorClass?: string;
  status: ReviewStatus;
  statusLabel: string;
  submittedAt: string;
  files: {
    diagnosticPdfUrl: string | null;
    dataPackageUrl: string | null;
    modificationLogUrl: string | null;
    aiReportUrl: string | null;
    hasDiagnosticPdf: boolean;
    hasDataPackage: boolean;
    hasModificationLog: boolean;
    hasAiReport: boolean;
  };
  assignedTo: {
    userId: number;
    name: string;
  };
}

export interface ReviewDetail extends ReviewListItem {
  aiVerdict?: string;
  whySummary?: string;
  comment?: string;
  categoryCommentE?: string;
  categoryCommentS?: string;
  categoryCommentG?: string;
}

export interface ReviewListParams {
  domainCode?: string;
  status?: ReviewStatus;
  riskLevel?: RiskLevel;
  companyId?: number;
  page?: number;
  size?: number;
}

export interface SubmitReviewData {
  decision: 'APPROVED' | 'REVISION_REQUIRED';
  score?: number;
  comment?: string;
  categoryCommentE?: string;
  categoryCommentS?: string;
  categoryCommentG?: string;
}

export interface JobResponse {
  jobId: string;
  status: 'PENDING';
}

export const getReviewsDashboard = async (domainCode?: string): Promise<ReviewDashboardResponse> => {
  const response = await apiClient.get<BaseResponse<{ summary: ReviewDashboardResponse } | ReviewDashboardResponse>>('/v1/reviews/dashboard', {
    params: domainCode ? { domainCode } : undefined,
  });
  const data = response.data.data;
  // summary 객체가 있으면 그 안의 데이터를, 없으면 data 자체를 반환
  return 'summary' in data ? data.summary : data;
};

export interface ReviewListResponse extends PagedData<ReviewListItem> {
  summary?: ReviewDashboardResponse;
}

export const getReviews = async (
  params: ReviewListParams = {}
): Promise<ReviewListResponse> => {
  const response = await apiClient.get<BaseResponse<ReviewListResponse>>('/v1/reviews', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getReviewDetail = async (id: number): Promise<ReviewDetail> => {
  const response = await apiClient.get<BaseResponse<ReviewDetail>>(`/v1/reviews/${id}`);
  return response.data.data;
};

export const submitReview = async (
  id: number,
  data: SubmitReviewData
): Promise<void> => {
  await apiClient.patch(`/v1/reviews/${id}`, data);
};

export const generateReport = async (id: number): Promise<JobResponse> => {
  const response = await apiClient.post<BaseResponse<JobResponse>>(`/v1/reviews/${id}/report`);
  return response.data.data;
};

export const bulkReport = async (reviewIds: number[]): Promise<JobResponse> => {
  const response = await apiClient.post<BaseResponse<JobResponse>>('/v1/reviews/bulk-report', { reviewIds });
  return response.data.data;
};

export const exportReviews = async (
  format: 'EXCEL' | 'CSV',
  reviewIds: number[]
): Promise<Blob> => {
  const response = await apiClient.post('/v1/reviews/export', { format, reviewIds }, {
    responseType: 'blob',
  });
  return response.data;
};
