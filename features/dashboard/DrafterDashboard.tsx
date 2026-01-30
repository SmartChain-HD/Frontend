import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar } from './components/DashboardSidebar';
import { StatsGrid } from './components/StatsGrid';
import { DataTable, Badge } from './components/DataTable';
import { ActivityFeed } from './components/ActivityFeed';

export default function DrafterDashboard() {
  const stats = [
    { label: '미제출', value: '4', color: 'error' as const },
    { label: '검토중', value: '3', color: 'primary' as const },
    { label: '보완요청', value: '2', color: 'warning' as const },
    { label: '완료', value: '20', color: 'success' as const }
  ];

  const tableData = [
    { document: '25년 4분기', reviewDate: '2026/01/09', status: 'draft', action: '제출하기' }
  ];

  const activities = [
    { time: '10:15 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' },
    { time: '10:13 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' },
    { time: '02:15 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' },
    { time: '02:14 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' },
    { time: '10:15 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' },
    { time: '10:15 AM', message: '[A공급사] 안전보건 대외수 입어수 업업 (3일) 확인' }
  ];

  const statusLabels: { [key: string]: string } = {
    draft: '미제출'
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-page-bg)]">
      <DashboardHeader userName="김기안" userRole="drafter" />
      
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-y-auto p-[40px]">
          <div className="max-w-[1440px] mx-auto space-y-[32px]">
            <h1 className="font-heading-large text-[var(--color-text-primary)]">대시보드</h1>
            
            <StatsGrid stats={stats} />
            
            <div className="grid grid-cols-[1fr_400px] gap-[32px]">
              <DataTable
                title="제출 필요 기안"
                tabs={['안전보건', '협력회사이력서', 'ESG']}
                columns={[
                  { key: 'document', label: '분기', width: '20%' },
                  { key: 'reviewDate', label: '마감일', width: '25%' },
                  { key: 'status', label: '상태', width: '20%' },
                  { key: 'action', label: '액션', width: '35%' }
                ]}
                data={tableData}
                renderCell={(key, value) => {
                  if (key === 'status') {
                    return <Badge variant={value}>{statusLabels[value]}</Badge>;
                  }
                  if (key === 'action') {
                    return (
                      <button className="bg-[var(--color-primary-main)] text-white px-[16px] py-[8px] rounded-[12px] font-title-xsmall hover:bg-[var(--color-primary-dark)] transition-colors">
                        {value}
                      </button>
                    );
                  }
                  return value;
                }}
              />
              
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
