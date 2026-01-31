import { useQuery } from '@tanstack/react-query';
import * as jobsApi from '../api/jobs';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useJobPolling = (jobId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.STATUS(jobId || ''),
    queryFn: () => jobsApi.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query?.state?.data?.status;
      if (status === 'SUCCEEDED' || status === 'FAILED') {
        return false;
      }
      return 2000;
    },
    retry: false,
  });
};
