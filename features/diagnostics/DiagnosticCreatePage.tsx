import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDiagnostic } from '../../src/hooks/useDiagnostics';
import { useCampaigns } from '../../src/hooks/useCampaigns';
import { diagnosticCreateSchema, type DiagnosticCreateFormData } from '../../src/validation/diagnostic';
import type { DomainCode } from '../../src/types/api.types';
import { DOMAIN_LABELS } from '../../src/types/api.types';
import DashboardLayout from '../../shared/layout/DashboardLayout';

const DOMAIN_OPTIONS: { value: DomainCode; label: string }[] = [
  { value: 'ESG', label: DOMAIN_LABELS.ESG },
  { value: 'SAFETY', label: DOMAIN_LABELS.SAFETY },
  { value: 'COMPLIANCE', label: DOMAIN_LABELS.COMPLIANCE },
];

export default function DiagnosticCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateDiagnostic();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      createMutation.reset();
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DiagnosticCreateFormData>({
    resolver: zodResolver(diagnosticCreateSchema),
    defaultValues: {
      title: '',
      campaignId: undefined,
      domainCode: undefined,
      periodStartDate: '',
      periodEndDate: '',
    },
  });

  const selectedCampaignId = watch('campaignId');

  useEffect(() => {
    if (!selectedCampaignId || campaigns.length === 0) return;

    const selectedCampaign = campaigns.find(
      (c) => c.campaignId === selectedCampaignId
    );
    if (!selectedCampaign) return;

    // 도메인 자동 설정
    if (selectedCampaign.domainCode) {
      setValue('domainCode', selectedCampaign.domainCode, { shouldValidate: true, shouldDirty: true });
    }

    // 기간 자동 설정
    if (selectedCampaign.startDate && selectedCampaign.endDate) {
      const startDate = new Date(selectedCampaign.startDate);
      const endDate = new Date(selectedCampaign.endDate);

      const periodStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      setValue('periodStartDate', formatDate(periodStart), { shouldValidate: true, shouldDirty: true });
      setValue('periodEndDate', formatDate(periodEnd), { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedCampaignId, campaigns, setValue]);

  const onSubmit = async (data: DiagnosticCreateFormData) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        if (!isMountedRef.current) return;
        const domainPath = data.domainCode.toLowerCase();
        navigate(`/dashboard/${domainPath}/upload?diagnosticId=${result.diagnosticId}`);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[24px] p-[24px] lg:p-[40px] max-w-[700px] mx-auto w-full">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/diagnostics')}
          className="flex items-center gap-[4px] font-body-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-fit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>

        {/* 제목 */}
        <h1 className="font-heading-small text-[var(--color-text-primary)]">새 기안 생성</h1>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[12px] border border-[var(--color-border-default)] p-[24px]">
          <div className="flex flex-col gap-[24px]">
            {/* 제목 */}
            <div>
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                기안 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="기안 제목을 입력하세요"
                className={`w-full px-[12px] py-[10px] rounded-[8px] border font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)] ${
                  errors.title ? 'border-red-500' : 'border-[var(--color-border-default)]'
                }`}
              />
              {errors.title && (
                <p className="mt-[4px] font-body-small text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* 캠페인 */}
            <div>
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                캠페인 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('campaignId', { valueAsNumber: true })}
                className={`w-full px-[12px] py-[10px] rounded-[8px] border font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)] bg-white ${
                  errors.campaignId ? 'border-red-500' : 'border-[var(--color-border-default)]'
                }`}
                disabled={campaignsLoading}
              >
                <option value="">캠페인을 선택하세요</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.campaignId} value={campaign.campaignId}>
                    {campaign.title}
                  </option>
                ))}
              </select>
              {errors.campaignId && (
                <p className="mt-[4px] font-body-small text-red-500">{errors.campaignId.message}</p>
              )}
            </div>

            {/* 도메인 */}
            <div>
              <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                도메인 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('domainCode')}
                className={`w-full px-[12px] py-[10px] rounded-[8px] border font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)] bg-white ${
                  errors.domainCode ? 'border-red-500' : 'border-[var(--color-border-default)]'
                }`}
              >
                <option value="">도메인을 선택하세요</option>
                {DOMAIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.domainCode && (
                <p className="mt-[4px] font-body-small text-red-500">{errors.domainCode.message}</p>
              )}
            </div>

            {/* 기안 기간 */}
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                  기안 시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('periodStartDate')}
                  className={`w-full px-[12px] py-[10px] rounded-[8px] border font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)] ${
                    errors.periodStartDate ? 'border-red-500' : 'border-[var(--color-border-default)]'
                  }`}
                />
                {errors.periodStartDate && (
                  <p className="mt-[4px] font-body-small text-red-500">{errors.periodStartDate.message}</p>
                )}
              </div>

              <div>
                <label className="font-title-xsmall text-[var(--color-text-secondary)] mb-[8px] block">
                  기안 종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('periodEndDate')}
                  className={`w-full px-[12px] py-[10px] rounded-[8px] border font-body-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-main)] ${
                    errors.periodEndDate ? 'border-red-500' : 'border-[var(--color-border-default)]'
                  }`}
                />
                {errors.periodEndDate && (
                  <p className="mt-[4px] font-body-small text-red-500">{errors.periodEndDate.message}</p>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-[12px] pt-[16px] border-t border-[var(--color-border-default)]">
              <button
                type="button"
                onClick={() => navigate('/diagnostics')}
                className="px-[20px] py-[10px] rounded-[8px] border border-[var(--color-border-default)] font-title-small text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="px-[20px] py-[10px] rounded-[8px] bg-[var(--color-primary-main)] font-title-small text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? '생성 중...' : '기안 생성'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
