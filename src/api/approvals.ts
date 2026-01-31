import { apiClient } from './client';
import type { BaseResponse, PagedData, ApprovalStatus } from '../types/api.types';

export interface ApprovalListItem {
  approvalId: number;
  diagnosticId: number;
  title: string;
  domainCode: string;
  companyName: string;
  drafterName: string;
  submittedAt: string;
  status: ApprovalStatus;
}

export interface ApprovalDetail extends ApprovalListItem {
  riskLevel?: string;
  aiVerdict?: string;
  comment?: string;
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

export const getApprovalDetail = async (id: number): Promise<ApprovalDetail> => {
  const response = await apiClient.get<BaseResponse<ApprovalDetail>>(`/v1/approvals/${id}`);
  return response.data.data;
};

export const processApproval = async (
  id: number,
  data: { decision: 'APPROVED' | 'REJECTED'; comment?: string }
): Promise<void> => {
  await apiClient.patch(`/v1/approvals/${id}`, data);
};

export const submitToReviewer = async (id: number): Promise<void> => {
  await apiClient.post(`/v1/approvals/${id}/submit-to-reviewer`);
};
