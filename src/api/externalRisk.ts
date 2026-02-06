import { apiClient } from './client';
import type { BaseResponse, PagedData } from '../types/api.types';

// ============================================
// Response DTOs
// ============================================

export interface ExternalRiskResult {
  id: number;
  companyId: number;
  companyName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  evidenceJson: string;
  detectedAt: string;
}

export interface RiskEvidence {
  source: string;
  title: string;
  snippet: string;
  url: string;
  date: string;
}

// ============================================
// Request DTOs
// ============================================

export interface RiskCompany {
  companyId: number;
  name: string;
}

export interface DetectRiskRequest {
  companyIds: number[];
}

export interface ExternalRiskListParams {
  page?: number;
  size?: number;
}

// ============================================
// Helper
// ============================================

export const parseEvidenceJson = (json: string | null | undefined): RiskEvidence[] => {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ============================================
// API Functions
// ============================================

/** 리스크 대상 회사 목록 조회 */
export const getRiskCompanies = async (): Promise<RiskCompany[]> => {
  const response = await apiClient.get<BaseResponse<RiskCompany[]>>(
    '/v1/risk/external/companies'
  );
  return response.data.data;
};

/** 리스크 분석 요청 (최대 60초 소요) */
export const detectRisk = async (
  data: DetectRiskRequest
): Promise<ExternalRiskResult[]> => {
  const response = await apiClient.post<BaseResponse<ExternalRiskResult[]>>(
    '/v1/risk/external/detect',
    data,
    { timeout: 310000 }
  );
  return response.data.data;
};

/** 특정 회사 최신 결과 조회 */
export const getLatestResult = async (
  companyId: number
): Promise<ExternalRiskResult> => {
  const response = await apiClient.get<BaseResponse<ExternalRiskResult>>(
    `/v1/risk/external/results/${companyId}`
  );
  return response.data.data;
};

/** 전체 결과 이력 조회 (페이지네이션) */
export const getAllResults = async (
  params: ExternalRiskListParams = {}
): Promise<PagedData<ExternalRiskResult>> => {
  const response = await apiClient.get<BaseResponse<PagedData<ExternalRiskResult>>>(
    '/v1/risk/external/results',
    { params: { page: 0, size: 10, ...params } }
  );
  return response.data.data;
};
