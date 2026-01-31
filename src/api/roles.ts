import { apiClient } from './client';
import type {
  BaseResponse,
  RoleRequestPageResponse,
  RoleRequestCreateDto,
  RoleRequestResponse,
  RoleRequestStatusDto,
  RoleApprovalListRequest,
  PagedData,
  RoleApprovalItemDto,
  RoleDecisionRequest,
  RoleDecisionResponse,
} from '../types/api.types';

export const getRoleRequestPage = async (): Promise<RoleRequestPageResponse> => {
  const response = await apiClient.get<BaseResponse<RoleRequestPageResponse>>('/v1/roles/request-page');
  return response.data.data;
};

export const createRoleRequest = async (data: RoleRequestCreateDto): Promise<RoleRequestResponse> => {
  const response = await apiClient.post<BaseResponse<RoleRequestResponse>>('/v1/roles/requests', data);
  return response.data.data;
};

export const getMyRoleRequests = async (): Promise<RoleRequestStatusDto> => {
  const response = await apiClient.get<BaseResponse<RoleRequestStatusDto>>('/v1/roles/requests/my');
  return response.data.data;
};

export const getRoleApprovalList = async (
  params: RoleApprovalListRequest = {}
): Promise<PagedData<RoleApprovalItemDto>> => {
  const response = await apiClient.get<BaseResponse<PagedData<RoleApprovalItemDto>>>('/v1/roles/requests', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const processRoleRequest = async (
  id: number,
  data: RoleDecisionRequest
): Promise<RoleDecisionResponse> => {
  const response = await apiClient.patch<BaseResponse<RoleDecisionResponse>>(`/v1/roles/requests/${id}`, data);
  return response.data.data;
};
