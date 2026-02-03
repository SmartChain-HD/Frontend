import { useQuery } from '@tanstack/react-query';
import * as campaignsApi from '../api/campaigns';
import type { GetCampaignsParams } from '../api/campaigns';

export const useCampaigns = (params?: GetCampaignsParams) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignsApi.getCampaigns(params),
  });
};

export const useCampaignDetail = (id: number) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.getCampaignDetail(id),
    enabled: id > 0,
  });
};
