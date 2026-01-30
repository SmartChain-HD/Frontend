interface BadgeProps {
  children: React.ReactNode;
  variant: 'draft' | 'approved' | 'pending' | 'rejected' | 'correction';
}

const badgeStyles = {
  draft: 'bg-[#FFF8E1] text-[#E65100] border-[#FFECB3]',
  approved: 'bg-[#F0FDF4] text-[#008233] border-[#86EFAC]',
  pending: 'bg-[#EFF4FC] text-[#002554] border-[#B0CBEF]',
  rejected: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FEE2E2]',
  correction: 'bg-[#FFF8E1] text-[#E65100] border-[#FFECB3]'
};

export function Badge({ children, variant }: BadgeProps) {
  return (
    <span className={`px-[12px] py-[4px] rounded-[12px] font-detail-medium border ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface TableRow {
  [key: string]: any;
}

interface DataTableProps {
  title: string;
  tabs?: string[];
  columns: TableColumn[];
  data: TableRow[];
  renderCell?: (key: string, value: any, row: TableRow) => React.ReactNode;
}

export function DataTable({ title, tabs, columns, data, renderCell }: DataTableProps) {
  return (
    <div className="bg-white rounded-[24px] p-[32px] shadow-sm border border-[var(--color-border-default)]">
      <h3 className="font-title-large text-[var(--color-text-primary)] mb-[24px]">{title}</h3>
      
      {/* Tabs if provided */}
      {tabs && (
        <div className="flex gap-[24px] mb-[24px] border-b border-[var(--color-border-default)]">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`pb-[12px] font-body-medium ${
                index === 0
                  ? 'text-[var(--color-primary-main)] border-b-2 border-[var(--color-primary-main)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border-default)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-[12px] px-[16px] font-title-small text-[var(--color-text-secondary)]"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[var(--color-border-default)] last:border-b-0 hover:bg-[var(--color-surface-primary)] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-[16px] px-[16px] font-body-medium text-[var(--color-text-primary)]">
                    {renderCell ? renderCell(col.key, row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
