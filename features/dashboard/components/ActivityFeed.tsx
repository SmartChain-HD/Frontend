interface ActivityItem {
  time: string;
  message: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-[24px] p-[32px] shadow-sm border border-[var(--color-border-default)]">
      <h3 className="font-title-large text-[var(--color-text-primary)] mb-[24px]">실시간 알림 피드</h3>
      
      <div className="space-y-[16px]">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-[12px] items-start">
            <div className="w-[8px] h-[8px] rounded-full bg-[#DC2626] mt-[8px] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-detail-small text-[var(--color-text-secondary)] mb-[4px]">{activity.time}</p>
              <p className="font-body-medium text-[var(--color-text-primary)]">{activity.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
