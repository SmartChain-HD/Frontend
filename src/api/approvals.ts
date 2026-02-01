import { apiClient } from './client';
import type { BaseResponse, PagedData, ApprovalStatus } from '../types/api.types';

export interface ApprovalListItem {
  approvalId: number;
  diagnostic: {
    diagnosticId: number;
    diagnosticCode: string;
    title: string;
    qualitativeProgress: number;
    quantitativeProgress: number;
    overallScore: number | null;
  };
  requester: {
    userId: number;
    name: string;
    email: string;
  };
  domainCode: string;
  domainName: string;
  status: ApprovalStatus;
  statusLabel: string;
  requestComment: string | null;
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  approverComment: string | null;
}

interface ApprovalListParams {
  domainCode?: string;
  status?: ApprovalStatus;
  page?: number;
  size?: number;
}

export const getApprovals = async (
  params: ApprovalListParams = {}
): Promise<PagedData<ApprovalListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<ApprovalListItem>>>('/v1/approvals', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getApprovalDetail = async (id: number): Promise<ApprovalListItem> => {
  const response = await apiClient.get<BaseResponse<ApprovalListItem>>(`/v1/approvals/${id}`);
  return response.data.data;
};

export const processApproval = async (
  id: number,
  data: { decision: 'APPROVED' | 'REJECTED'; comment?: string; rejectReason?: string }
): Promise<void> => {
  await apiClient.patch(`/v1/approvals/${id}`, data);
};

export const submitToReviewer = async (id: number): Promise<void> => {
  await apiClient.post(`/v1/approvals/${id}/submit-to-reviewer`);
};
