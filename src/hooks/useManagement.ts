import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as managementApi from '../api/management';
import type { UserListParams, CompanyListParams, RegisterCompanyRequest, ActivityLogParams, ExportActivityLogsRequest } from '../api/management';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

export const usePermissionsDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.PERMISSIONS_DASHBOARD,
    queryFn: managementApi.getPermissionsDashboard,
  });
};

export const useUsers = (params?: UserListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.USERS(params),
    queryFn: () => managementApi.getUsers(params),
  });
};

export const useCompanies = (params?: CompanyListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.COMPANIES_LIST(params),
    queryFn: () => managementApi.getCompanies(params),
  });
};

export const useActivityLogs = (params?: ActivityLogParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.MANAGEMENT.ACTIVITY_LOGS(params),
    queryFn: () => managementApi.getActivityLogs(params),
  });
};

export const useExportActivityLogs = () => {
  return useMutation({
    mutationFn: (data: ExportActivityLogsRequest) => managementApi.exportActivityLogs(data),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = variables.format === 'CSV' ? 'csv' : 'xlsx';
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `activity-logs-${timestamp}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('파일이 다운로드되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { decision: 'APPROVED' | 'REJECTED' } }) =>
      managementApi.updatePermission(id, data),
    onSuccess: () => {
      toast.success('권한이 처리되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['management'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { roleCode: string } }) =>
      managementApi.updateUserRole(userId, data),
    onSuccess: () => {
      toast.success('역할이 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['management'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { status: string } }) =>
      managementApi.updateUserStatus(userId, data),
    onSuccess: () => {
      toast.success('상태가 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['management'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useRegisterCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterCompanyRequest) => managementApi.registerCompany(data),
    onSuccess: () => {
      toast.success('회사가 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['management'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
