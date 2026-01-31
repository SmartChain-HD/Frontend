import { apiClient } from './client';
import type { BaseResponse, PagedData } from '../types/api.types';

export interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export const getNotifications = async (
  params: { page?: number; size?: number } = {}
): Promise<PagedData<NotificationItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<NotificationItem>>>('/v1/notifications', {
    params: { page: 0, size: 20, ...params },
  });
  return response.data.data;
};

export const markAsRead = async (ids: number[]): Promise<void> => {
  await apiClient.patch('/v1/notifications/read', { notificationIds: ids });
};
