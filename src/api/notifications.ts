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
  referenceId?: number;
  referenceType?: string;
}

// 알림 타입에 따라 이동할 링크 생성
export function getNotificationLink(notification: NotificationItem): string | undefined {
  // 백엔드에서 제공하는 link가 있으면 우선 사용
  if (notification.link) {
    return notification.link;
  }

  // referenceId가 없으면 이동 불가
  if (!notification.referenceId) {
    return undefined;
  }

  // 알림 타입에 따른 링크 생성
  switch (notification.type) {
    case 'DIAGNOSTIC_SUBMITTED':
    case 'DIAGNOSTIC_RETURNED':
    case 'APPROVAL_COMPLETED':
    case 'REVIEW_COMPLETED':
      return `/diagnostics/${notification.referenceId}`;

    case 'APPROVAL_REQUESTED':
      return `/approvals/${notification.referenceId}`;

    case 'REVIEW_REQUESTED':
      return `/diagnostics/${notification.referenceId}`;

    default:
      return undefined;
  }
}

export interface NotificationListParams {
  isRead?: boolean;
  page?: number;
  size?: number;
}

export const getNotifications = async (
  params: NotificationListParams = {}
): Promise<PagedData<NotificationItem>> => {
  const response = await apiClient.get<BaseResponse<PagedData<NotificationItem>>>('/v1/notifications', {
    params: { page: 0, size: 20, ...params },
  });
  return response.data.data;
};

export const markAsRead = async (ids: number[]): Promise<void> => {
  await apiClient.patch('/v1/notifications/read', { notificationIds: ids });
};

export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/v1/notifications/read', { readAll: true });
};
