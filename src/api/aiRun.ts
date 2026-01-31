import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export interface SlotStatus {
  slotName: string;
  required: boolean;
  submitted: boolean;
}

export interface SlotHint {
  fileId: string;
  slotName: string;
  confidence?: number;
}

export interface RunPreviewResponse {
  packageId: string;
  requiredSlotStatus: SlotStatus[];
  slotHints: SlotHint[];
  missingRequiredSlots: string[];
}

export interface SlotResult {
  slotName: string;
  status: 'VALID' | 'INVALID' | 'MISSING';
  message?: string;
  extractedData?: Record<string, unknown>;
}

export interface AiAnalysisResultResponse {
  resultId: number;
  diagnosticId: number;
  domainCode: string;
  packageId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  whySummary: string;
  resultJson: string;
  analyzedAt: string;
}

export interface AiResultDetailResponse extends AiAnalysisResultResponse {
  slotResults: SlotResult[];
  clarifications: Array<{ targetSlot: string; code: string; message: string }>;
}

export const previewAiRun = async (
  diagnosticId: number,
  fileIds: number[]
): Promise<RunPreviewResponse> => {
  const response = await apiClient.post<BaseResponse<RunPreviewResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/preview`,
    { fileIds }
  );
  return response.data.data;
};

export const submitAiRun = async (diagnosticId: number): Promise<void> => {
  await apiClient.post(`/v1/ai/run/diagnostics/${diagnosticId}/submit`);
};

export const getAiResult = async (diagnosticId: number): Promise<AiAnalysisResultResponse> => {
  const response = await apiClient.get<BaseResponse<AiAnalysisResultResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/result`
  );
  return response.data.data;
};

export const getAiResultDetail = async (diagnosticId: number): Promise<AiResultDetailResponse> => {
  const response = await apiClient.get<BaseResponse<AiResultDetailResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/result/detail`
  );
  return response.data.data;
};

export const getAiHistory = async (diagnosticId: number): Promise<AiAnalysisResultResponse[]> => {
  const response = await apiClient.get<BaseResponse<AiAnalysisResultResponse[]>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/history`
  );
  return response.data.data;
};
