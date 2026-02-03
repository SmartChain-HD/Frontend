import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export interface Campaign {
  campaignId: number;
  campaignCode: string;
  domainCode?: 'ESG' | 'SAFETY' | 'COMPLIANCE' | null;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  deadline?: string;
  status: string;
  statusLabel?: string;
  targetCompanyCount?: number;
  submittedCount?: number;
  progressRate?: number;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  totalCount: number;
}

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await apiClient.get<BaseResponse<CampaignsResponse>>('/v1/campaigns');
  return response.data.data.campaigns;
};

export const getCampaignDetail = async (id: number): Promise<Campaign> => {
  const response = await apiClient.get<BaseResponse<Campaign>>(`/v1/campaigns/${id}`);
  return response.data.data;
};
