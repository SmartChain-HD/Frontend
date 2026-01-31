import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as approvalsApi from '../api/approvals';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse, ApprovalStatus } from '../types/api.types';

interface ApprovalListParams {
  domainCode?: string;
  status?: ApprovalStatus;
  page?: number;
  size?: number;
}

export const useApprovals = (params?: ApprovalListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS.LIST(params),
    queryFn: () => approvalsApi.getApprovals(params),
  });
};

export const useApprovalDetail = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS.DETAIL(id),
    queryFn: () => approvalsApi.getApprovalDetail(id),
    enabled: id > 0,
  });
};

export const useProcessApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { decision: 'APPROVED' | 'REJECTED'; comment?: string; rejectReason?: string } }) =>
      approvalsApi.processApproval(id, data),
    onSuccess: () => {
      toast.success('결재 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useSubmitToReviewer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalsApi.submitToReviewer,
    onSuccess: () => {
      toast.success('원청에 제출되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
