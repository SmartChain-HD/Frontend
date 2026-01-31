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
  roleCode: string;
  company?: string;
  companyId?: number;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
  createdAt?: string;
}

export interface CompanyListItem {
  companyId: number;
  companyName: string;
  companyType: 'SUPPLIER' | 'CONTRACTOR';
  userCount: number;
  createdAt?: string;
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  roleCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  companyId?: number;
}

export interface CompanyListParams {
  page?: number;
  size?: number;
  search?: string;
  companyType?: 'SUPPLIER' | 'CONTRACTOR';
}

export interface RegisterCompanyRequest {
  companyName: string;
  companyType: 'SUPPLIER' | 'CONTRACTOR';
  businessNumber?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ActivityLogItem {
  logId: number;
  userId: number;
  userName: string;
  action: string;
  actionType: string;
  target: string;
  targetId?: number;
  ipAddress?: string;
  createdAt: string;
}

export interface ActivityLogParams {
  page?: number;
  size?: number;
  userId?: number;
  fromDate?: string;
  toDate?: string;
  actionType?: string;
}

export interface ExportActivityLogsRequest {
  format: 'CSV' | 'EXCEL';
  fromDate?: string;
  toDate?: string;
}

export const getPermissionsDashboard = async (): Promise<PermissionsDashboardResponse> => {
  const response = await apiClient.get<BaseResponse<PermissionsDashboardResponse>>(
    '/v1/management/permissions/dashboard'
  );
  return response.data.data;
};

export const getUsers = async (
  params: UserListParams = {}
): Promise<PagedData<UserListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<UserListItem>>>('/v1/management/users', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const getCompanies = async (
  params: CompanyListParams = {}
): Promise<PagedData<CompanyListItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<CompanyListItem>>>('/v1/management/companies', {
    params: { page: 0, size: 10, ...params },
  });
  return response.data.data;
};

export const registerCompany = async (
  data: RegisterCompanyRequest
): Promise<CompanyListItem> => {
  const response = await apiClient.post<BaseResponse<CompanyListItem>>('/v1/management/companies', data);
  return response.data.data;
};

export const getActivityLogs = async (
  params: ActivityLogParams = {}
): Promise<PagedData<ActivityLogItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<ActivityLogItem>>>(
    '/v1/management/activity-logs',
    { params: { page: 0, size: 20, ...params } }
  );
  return response.data.data;
};

export const exportActivityLogs = async (
  data: ExportActivityLogsRequest
): Promise<Blob> => {
  const response = await apiClient.post('/v1/management/activity-logs/export', data, {
    responseType: 'blob',
  });
  return response.data;
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
