import { apiClient } from './client';
import type { BaseResponse, PagedData, DiagnosticStatus } from '../types/api.types';

export interface DiagnosticListItem {
  diagnosticId: number;
  title: string;
  domainCode: string;
  companyName: string;
  period: string;
  submittedAt?: string;
  status: DiagnosticStatus;
  riskLevel?: string;
}

export interface DiagnosticDetail {
  diagnosticId: number;
  title: string;
  domainCode: string;
  company: { companyId: number; companyName: string };
  drafter: { userId: number; name: string };
  status: DiagnosticStatus;
  periodStartDate: string;
  periodEndDate: string;
  createdAt: string;
  submittedAt?: string;
}

export interface DiagnosticCreateRequest {
  title: string;
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

interface DiagnosticListParams {
  domainCode?: string;
  status?: DiagnosticStatus;
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
