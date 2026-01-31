import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as notificationsApi from '../api/notifications';
import type { NotificationListParams } from '../api/notifications';
import { QUERY_KEYS } from '../constants/queryKeys';
import { useAuthStore } from '../store/authStore';

export const useNotifications = (params?: NotificationListParams) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: isAuthenticated,
  });
};

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS.LIST({ isRead: false }), 'count'],
    queryFn: async () => {
      const data = await notificationsApi.getNotifications({ isRead: false, page: 0, size: 1 });
      return data.page.totalElements;
    },
    enabled: isAuthenticated,
    refetchInterval: 60_000, // 1분마다 갱신
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      toast.success('모든 알림을 읽음 처리했습니다.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
