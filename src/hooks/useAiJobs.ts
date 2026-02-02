import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as aiJobsApi from '../api/aiJobs';
import type { JobDetail } from '../api/aiJobs';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useJobStatus = (jobId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.STATUS(jobId ?? ''),
    queryFn: () => aiJobsApi.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'SUCCEEDED' || status === 'FAILED') {
        return false;
      }
      return 5000;
    },
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => aiJobsApi.retryJob(jobId),
    onSuccess: (_data: JobDetail, jobId: string) => {
      toast.success('작업 재시도가 요청되었습니다.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.STATUS(jobId) });
    },
    onError: (error: AxiosError) => {
      toast.error('작업 재시도에 실패했습니다.');
      console.error('Job retry failed:', error);
    },
  });
};
