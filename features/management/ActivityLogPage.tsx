import { useState } from 'react';
import { useActivityLogs } from '../../src/hooks/useManagement';
import type { ActivityLogParams } from '../../src/api/management';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const ACTION_TYPE_OPTIONS = [
  { value: '', label: '전체 액션' },
  { value: 'LOGIN', label: '로그인' },
  { value: 'LOGOUT', label: '로그아웃' },
  { value: 'CREATE', label: '생성' },
  { value: 'UPDATE', label: '수정' },
  { value: 'DELETE', label: '삭제' },
  { value: 'APPROVE', label: '승인' },
  { value: 'REJECT', label: '반려' },
  { value: 'SUBMIT', label: '제출' },
  { value: 'DOWNLOAD', label: '다운로드' },
];

const ACTION_TYPE_STYLES: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  REJECT: 'bg-orange-100 text-orange-700',
  SUBMIT: 'bg-purple-100 text-purple-700',
  DOWNLOAD: 'bg-cyan-100 text-cyan-700',
};

export default function ActivityLogPage() {
  const [params, setParams] = useState<ActivityLogParams>({
    page: 0,
    size: 20,
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionType, setActionType] = useState('');

  const { data, isLoading, isError, refetch } = useActivityLogs(params);
  const logs = data?.content || [];
  const pageInfo = data?.page;
  const totalPages = pageInfo?.totalPages || 0;

  const handleFilter = () => {
    setParams({
      ...params,
      page: 0,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      actionType: actionType || undefined,
    });
  };

  const handleResetFilter = () => {
    setFromDate('');
    setToDate('');
    setActionType('');
    setParams({
      page: 0,
      size: 20,
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[1400px] mx-auto w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading-small text-[var(--color-text-primary)]">활동 로그</h1>
            <p className="font-body-medium text-[var(--color-text-tertiary)] mt-[4px]">
              시스템 활동 이력을 조회합니다
            </p>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[20px]">
          <div className="flex flex-wrap items-end gap-[16px]">
            {/* 시작일 */}
            <div className="flex-1 min-w-[160px]">
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                시작일
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)]"
              />
            </div>

            {/* 종료일 */}
            <div className="flex-1 min-w-[160px]">
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                종료일
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)]"
              />
            </div>

            {/* 액션 유형 */}
            <div className="flex-1 min-w-[160px]">
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                액션 유형
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full px-[12px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-body-medium text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-primary-main)]"
              >
                {ACTION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 버튼 */}
            <div className="flex gap-[8px]">
              <button
                onClick={handleResetFilter}
                className="px-[16px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
              <button
                onClick={handleFilter}
                className="px-[16px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] text-white font-title-small hover:opacity-90 transition-colors"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 로그 테이블 */}
        <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-gray-50">
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)] w-[180px]">
                  일시
                </th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)] w-[120px]">
                  사용자
                </th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)] w-[100px]">
                  액션
                </th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)]">
                  대상
                </th>
                <th className="px-[16px] py-[12px] text-left font-title-xsmall text-[var(--color-text-secondary)] w-[140px]">
                  IP 주소
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <div className="inline-block w-[32px] h-[32px] border-[3px] border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <div className="flex flex-col items-center gap-[12px]">
                      <p className="font-body-medium text-[var(--color-state-error-text)]">
                        로그를 불러오는 데 실패했습니다.
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="font-title-xsmall text-[var(--color-primary-main)] hover:underline"
                      >
                        다시 시도
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-[60px]">
                    <svg className="w-[48px] h-[48px] mx-auto mb-[12px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-body-medium text-[var(--color-text-tertiary)]">
                      활동 로그가 없습니다.
                    </p>
                  </td>
                </tr>
              )}

              {logs.map((log) => (
                <tr
                  key={log.logId}
                  className="border-b border-[var(--color-border-default)] hover:bg-gray-50 transition-colors"
                >
                  <td className="px-[16px] py-[14px] font-body-small text-[var(--color-text-tertiary)]">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-primary)]">
                    {log.userName}
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span className={`inline-block px-[8px] py-[4px] rounded font-detail-small ${
                      ACTION_TYPE_STYLES[log.actionType] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-[16px] py-[14px] font-body-medium text-[var(--color-text-secondary)]">
                    {log.target}
                  </td>
                  <td className="px-[16px] py-[14px] font-body-small text-[var(--color-text-tertiary)]">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] pt-[8px]">
            <button
              onClick={() => setParams({ ...params, page: Math.max(0, (params.page || 0) - 1) })}
              disabled={(params.page || 0) === 0}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              이전
            </button>
            <span className="font-body-medium text-[var(--color-text-primary)]">
              {(params.page || 0) + 1} / {totalPages}
            </span>
            <button
              onClick={() => setParams({ ...params, page: Math.min(totalPages - 1, (params.page || 0) + 1) })}
              disabled={(params.page || 0) >= totalPages - 1}
              className="px-[12px] py-[8px] rounded-[8px] font-body-medium text-[var(--color-text-secondary)] hover:bg-gray-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}

        {/* 페이지 정보 */}
        {pageInfo && (
          <div className="text-center">
            <p className="font-body-small text-[var(--color-text-tertiary)]">
              총 {pageInfo.totalElements.toLocaleString()}건
            </p>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
