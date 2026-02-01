import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../src/hooks/useNotifications';
import type { NotificationItem } from '../../src/api/notifications';
import DashboardLayout from '../../shared/layout/DashboardLayout';

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  ROLE_REQUEST: '권한 요청',
  ROLE_APPROVED: '권한 승인',
  ROLE_REJECTED: '권한 반려',
  DIAGNOSTIC_SUBMITTED: '기안 제출',
  DIAGNOSTIC_RETURNED: '기안 반려',
  APPROVAL_REQUESTED: '결재 요청',
  APPROVAL_COMPLETED: '결재 완료',
  REVIEW_REQUESTED: '심사 요청',
  REVIEW_COMPLETED: '심사 완료',
  SYSTEM: '시스템',
};

type FilterTab = 'all' | 'unread' | 'read';

function NotificationCard({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: NotificationItem;
  onMarkRead: (id: number) => void;
  onNavigate: (link: string) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.notificationId);
    }
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-[16px] p-[20px] rounded-[12px] border transition-colors cursor-pointer ${
        notification.read
          ? 'bg-white border-[var(--color-border-default)] hover:bg-gray-50'
          : 'bg-[var(--color-primary-light)] border-[var(--color-primary-border)] hover:bg-blue-50'
      }`}
    >
      {/* 읽음 상태 인디케이터 */}
      <div className="pt-[6px] shrink-0">
        <div
          className={`w-[8px] h-[8px] rounded-full ${
            notification.read ? 'bg-transparent' : 'bg-[var(--color-primary-main)]'
          }`}
        />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[4px]">
          <span className="font-title-xsmall text-[var(--color-primary-main)]">
            {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
          </span>
          <span className="font-detail-small text-[var(--color-text-tertiary)]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="font-title-small text-[var(--color-text-primary)] mb-[4px]">
          {notification.title}
        </p>
        <p className="font-body-medium text-[var(--color-text-secondary)] truncate">
          {notification.message}
        </p>
      </div>

      {/* 링크 화살표 */}
      {notification.link && (
        <div className="shrink-0 pt-[4px] text-[var(--color-text-tertiary)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(0);

  const isReadParam = activeTab === 'unread' ? false : activeTab === 'read' ? true : undefined;
  const { data, isLoading, isError } = useNotifications({ isRead: isReadParam, page, size: 20 });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = data?.content || [];
  const pageInfo = data?.page;
  const totalPages = pageInfo?.totalPages || 0;

  const handleMarkRead = (id: number) => {
    markAsReadMutation.mutate([id]);
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNavigate = (link: string) => {
    navigate(link);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'unread', label: '안읽음' },
    { key: 'read', label: '읽음' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[800px] mx-auto w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading-small text-[var(--color-text-primary)]">알림</h1>
          <button
            onClick={handleMarkAllRead}
            disabled={markAllAsReadMutation.isPending}
            className="font-title-xsmall text-[var(--color-primary-main)] hover:underline disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? '처리 중...' : '모두 읽음'}
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-[8px]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(0); }}
              className={`px-[16px] py-[8px] rounded-full font-title-xsmall transition-colors ${
                activeTab === tab.key
                  ? 'bg-[var(--color-primary-main)] text-white'
                  : 'bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 알림 목록 */}
        <div className="flex flex-col gap-[12px]">
          {isLoading && (
            <div className="flex items-center justify-center py-[60px]">
              <div className="w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isError && (
            <div className="text-center py-[60px]">
              <p className="font-body-medium text-[var(--color-state-error-text)]">
                알림을 불러오는 데 실패했습니다.
              </p>
            </div>
          )}

          {!isLoading && !isError && notifications.length === 0 && (
            <div className="text-center py-[60px]">
              <p className="font-body-medium text-[var(--color-text-tertiary)]">
                {activeTab === 'unread' ? '읽지 않은 알림이 없습니다.' : '알림이 없습니다.'}
              </p>
            </div>
          )}

          {notifications.map((notification) => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] pt-[16px]">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              이전
            </button>
            <span className="font-body-medium text-[var(--color-text-primary)]">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
