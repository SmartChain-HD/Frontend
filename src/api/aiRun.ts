import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export interface SlotStatus {
  slot_name: string;
  display_name?: string;
  status: 'SUBMITTED' | 'MISSING';
}

export interface SlotHint {
  file_id: string;
  slot_name: string;
  display_name?: string;
  confidence?: number;
  match_reason?: string;
}

export interface RunPreviewResponse {
  package_id: string;
  required_slot_status: SlotStatus[];
  slot_hint: SlotHint[];
  missing_required_slots: string[];
}

export interface SlotResult {
  slotName: string;
  status: 'VALID' | 'INVALID' | 'MISSING';
  message?: string;
  extractedData?: Record<string, unknown>;
}

// 슬롯별 extras 타입
export interface SlotExtras {
  analysis_message?: string;
  analysis_detail?: string;
  reason_descriptions?: string;
  success_points?: string;
  issue_points?: string;
  person_count?: string;
  person_count_yolo?: string;
  person_count_llm?: string;
  person_count_gap?: string;
  [key: string]: unknown;
}

// 새 API 응답 타입
export interface SlotResultDetail {
  slot_name: string;
  display_name?: string;
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  reasons: string[];
  file_ids: string[];
  file_names: string[];
  extras?: SlotExtras;
}

export interface ClarificationDetail {
  slot_name: string;
  message: string;
  file_ids: string[];
}

export interface CrossValidationResult {
  slots: string[];
  displayNames: string[];
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  reasons: string[];
  extras?: Record<string, unknown>;
}

// 최상위 extras 타입
export interface AnalysisExtras {
  service_why?: string;
  [key: string]: unknown;
}

export interface AiAnalysisDetails {
  slot_results: SlotResultDetail[];
  clarifications: ClarificationDetail[];
  crossValidations?: CrossValidationResult[];
  extras?: AnalysisExtras;
}

export interface AiAnalysisResultResponse {
  id: number;  // 기존 resultId → id
  diagnosticId: number;
  domainCode: string;
  packageId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  whySummary: string;
  details: AiAnalysisDetails;  // 기존 resultJson → details
  analyzedAt: string;
}

export interface AiResultDetailResponse extends AiAnalysisResultResponse {
  slotResults: SlotResult[];
  clarifications: Array<{ targetSlot: string; code: string; message: string }>;
}

export const previewAiRun = async (
  diagnosticId: number,
  fileIds: number[],
  removedFileIds?: string[],
  packageId?: string
): Promise<RunPreviewResponse> => {
  const response = await apiClient.post<BaseResponse<RunPreviewResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/preview`,
    {
      fileIds,
      ...(removedFileIds?.length ? { removedFileIds } : {}),
      ...(packageId ? { packageId } : {}),
    },
    { timeout: 35000 }
  );
  return response.data.data;
};

export const submitAiRun = async (
  diagnosticId: number,
  slotHints: SlotHint[]
): Promise<void> => {
  await apiClient.post(`/v1/ai/run/diagnostics/${diagnosticId}/submit`, { slotHints });
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
