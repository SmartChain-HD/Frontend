import { useQuery } from '@tanstack/react-query';
import * as campaignsApi from '../api/campaigns';

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.getCampaigns,
  });
};

export const useCampaignDetail = (id: number) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.getCampaignDetail(id),
    enabled: id > 0,
  });
};
