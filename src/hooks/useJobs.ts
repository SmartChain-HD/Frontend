import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export const useRetryJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.retryJob,
    onSuccess: (data) => {
      toast.success('재시도를 시작합니다.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.STATUS(data.jobId) });
    },
    onError: () => {
      toast.error('재시도에 실패했습니다.');
    },
  });
};
