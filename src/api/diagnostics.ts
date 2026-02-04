import { apiClient } from './client';
import type { BaseResponse, PagedData, DiagnosticStatus } from '../types/api.types';

export interface DiagnosticListItem {
  diagnosticId: number;
  diagnosticCode: string;
  domain: { domainId: number; code: string; name: string };
  campaign: { campaignId: number; campaignCode: string; title: string };
  summary: string;
  period: { startDate: string; endDate: string };
  deadline: string;
  status: DiagnosticStatus;
  statusLabel: string;
  progress: { qualitative: number; quantitative: number; overall: number };
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticDetail {
  diagnosticId: number;
  diagnosticCode: string;
  title?: string;
  summary?: string;
  domain: { domainId: number; code: string; name: string };
  campaign: { campaignId: number; campaignCode: string; title: string; disclosureStandards?: string[] };
  company: { companyId: number; companyName: string; industryCode?: string | null };
  period: { startDate: string; endDate: string };
  deadline: string;
  status: DiagnosticStatus;
  statusLabel: string;
  qualitativeProgress: number;
  quantitativeProgress: number;
  overallProgress: number;
  createdBy: { userId: number; name: string };
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface DiagnosticCreateRequest {
  title: string;
  campaignId: number;
  domainCode: string;
  periodStartDate: string;
  periodEndDate: string;
}

export interface DiagnosticHistoryItem {
  status: DiagnosticStatus;
  changedAt: string;
  changedBy: string;
  comment?: string;
}

export interface DiagnosticListParams {
  domainCode?: string;
  status?: DiagnosticStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export const getDiagnostics = async (
  params: DiagnosticListParams = {}
): Promise<PagedData<DiagnosticListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<DiagnosticListItem>>>('/v1/diagnostics', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getDiagnosticDetail = async (id: number): Promise<DiagnosticDetail> => {
  const response = await apiClient.get<BaseResponse<DiagnosticDetail>>(`/v1/diagnostics/${id}`);
  return response.data.data;
};

export const createDiagnostic = async (data: DiagnosticCreateRequest): Promise<DiagnosticDetail> => {
  const response = await apiClient.post<BaseResponse<DiagnosticDetail>>('/v1/diagnostics', data);
  return response.data.data;
};

export interface DiagnosticSubmitRequest {
  approverId: number;
  comment?: string;
}

export const submitDiagnostic = async (
  id: number,
  data: DiagnosticSubmitRequest
): Promise<void> => {
  await apiClient.post(`/v1/diagnostics/${id}/submit`, data);
};

export const getDiagnosticHistory = async (id: number): Promise<DiagnosticHistoryItem[]> => {
  const response = await apiClient.get<BaseResponse<DiagnosticHistoryItem[]>>(
    `/v1/diagnostics/${id}/history`
  );
  return response.data.data;
};
