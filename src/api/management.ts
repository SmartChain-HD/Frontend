import { apiClient } from './client';
import type { BaseResponse, PagedData } from '../types/api.types';

export interface PermissionsDashboardResponse {
  totalUsers: number;
  pendingRequests: number;
  activeCompanies: number;
}

export interface UserListItem {
  userId: number;
  name: string;
  email: string;
  role: string;
  company?: string;
  status: string;
  lastLoginAt?: string;
}

export interface CompanyListItem {
  companyId: number;
  companyName: string;
  companyType: string;
  userCount: number;
}

export interface ActivityLogItem {
  logId: number;
  userId: number;
  userName: string;
  action: string;
  target: string;
  createdAt: string;
}

export const getPermissionsDashboard = async (): Promise<PermissionsDashboardResponse> => {
  const response = await apiClient.get<BaseResponse<PermissionsDashboardResponse>>(
    '/v1/management/permissions/dashboard'
  );
  return response.data.data;
};

export const getUsers = async (
  params: { page?: number; size?: number } = {}
): Promise<PagedData<UserListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<UserListItem>>>('/v1/management/users', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getCompanies = async (): Promise<CompanyListItem[]> => {
  const response = await apiClient.get<BaseResponse<CompanyListItem[]>>('/v1/management/companies');
  return response.data.data;
};

export const getActivityLogs = async (
  params: { page?: number; size?: number } = {}
): Promise<PagedData<ActivityLogItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<ActivityLogItem>>>(
    '/v1/management/activity-logs',
    { params: { page: 0, size: 20, ...params } }
  );
  return response.data.data;
};

export const updatePermission = async (
  id: number,
  data: { decision: 'APPROVED' | 'REJECTED' }
): Promise<void> => {
  await apiClient.patch(`/v1/management/permissions/${id}`, data);
};

export const updateUserRole = async (
  userId: number,
  data: { roleCode: string }
): Promise<void> => {
  await apiClient.patch(`/v1/management/users/${userId}/role`, data);
};

export const updateUserStatus = async (
  userId: number,
  data: { status: string }
): Promise<void> => {
  await apiClient.patch(`/v1/management/users/${userId}/status`, data);
};
