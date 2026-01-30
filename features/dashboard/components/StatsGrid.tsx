interface StatCardProps {
  label: string;
  value: string | number;
  color: 'default' | 'error' | 'primary' | 'warning' | 'success';
}

const colorStyles = {
  default: 'text-[var(--color-text-primary)]',
  error: 'text-[#DC2626]',
  primary: 'text-[var(--color-primary-main)]',
  warning: 'text-[#FF8F00]',
  success: 'text-[#009619]'
};

export function StatCard({ label, value, color = 'default' }: StatCardProps) {
  return (
    <div className="flex flex-col gap-[12px]">
      <p className="font-title-small text-[var(--color-text-primary)]">{label}</p>
      <p className={`font-heading-medium ${colorStyles[color]}`}>{value}</p>
    </div>
  );
}

interface StatsGridProps {
  stats: { label: string; value: string | number; color?: 'default' | 'error' | 'primary' | 'warning' | 'success' }[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="bg-white rounded-[24px] p-[32px] shadow-sm border border-[var(--color-border-default)]">
      <div className="grid grid-cols-4 gap-[48px]">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
