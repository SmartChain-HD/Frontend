import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar } from './components/DashboardSidebar';
import { StatsGrid } from './components/StatsGrid';
import { DataTable, Badge } from './components/DataTable';
import { ActivityFeed } from './components/ActivityFeed';

export default function ReceiverDashboard() {
  const stats = [
    { label: '전체 협력사', value: '3,354', color: 'primary' as const },
    { label: '미제출', value: '12', color: 'error' as const },
    { label: '검토중', value: '45', color: 'primary' as const },
    { label: '보완요청', value: '28', color: 'warning' as const },
    { label: '완료', value: '3,269', color: 'success' as const }
  ];

  const tableData = [
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'correction' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'approved' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'approved' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'correction' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'correction' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'correction' },
    { company: '(주)KDMH', drafter: '25년 4분기 안전보건 점검', reviewer: '협력회사이력서', date: '2026/01/09', status: 'correction' }
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
    correction: '보정',
    approved: '정정',
    pending: '보관',
    draft: '미제출'
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-page-bg)]">
      <DashboardHeader userName="김승남" userRole="receiver" />
      
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-y-auto p-[40px]">
          <div className="max-w-[1440px] mx-auto space-y-[32px]">
            <h1 className="font-heading-large text-[var(--color-text-primary)]">대시보드</h1>
            
            <StatsGrid stats={stats} />
            
            <div className="grid grid-cols-[1fr_400px] gap-[32px]">
              <DataTable
                title="협력사 리스크 관리"
                tabs={['안전보건', '협력회사이력서', 'ESG']}
                columns={[
                  { key: 'company', label: '협력사 명', width: '15%' },
                  { key: 'drafter', label: '기안명', width: '25%' },
                  { key: 'reviewer', label: '제출일', width: '20%' },
                  { key: 'date', label: '상태', width: '15%' },
                  { key: 'status', label: '액션', width: '15%' }
                ]}
                data={tableData}
                renderCell={(key, value) => {
                  if (key === 'status') {
                    return <Badge variant={value}>{statusLabels[value]}</Badge>;
                  }
                  if (key === 'date') {
                    return <span className="font-body-small text-[var(--color-text-secondary)]">{value}</span>;
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
