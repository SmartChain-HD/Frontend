import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as rolesApi from '../api/roles';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse, RoleApprovalListRequest, RoleDecisionRequest } from '../types/api.types';

export const useRoleRequestPage = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.REQUEST_PAGE,
    queryFn: rolesApi.getRoleRequestPage,
  });
};

export const useCreateRoleRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.createRoleRequest,
    onSuccess: (data) => {
      toast.success(data.message || '권한 요청이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.REQUEST_PAGE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.MY_REQUESTS });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useMyRoleRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.MY_REQUESTS,
    queryFn: rolesApi.getMyRoleRequests,
  });
};

export const useRoleApprovalList = (params?: RoleApprovalListRequest) => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.APPROVAL_LIST(params),
    queryFn: () => rolesApi.getRoleApprovalList(params),
  });
};

export const useProcessRoleRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleDecisionRequest }) =>
      rolesApi.processRoleRequest(id, data),
    onSuccess: () => {
      toast.success('처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
