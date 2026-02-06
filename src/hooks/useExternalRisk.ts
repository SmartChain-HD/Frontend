import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as externalRiskApi from '../api/externalRisk';
import type { ExternalRiskListParams } from '../api/externalRisk';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

/** 리스크 대상 회사 목록 조회 */
export const useRiskCompanies = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EXTERNAL_RISK.COMPANIES(),
    queryFn: externalRiskApi.getRiskCompanies,
  });
};

/** 전체 리스크 결과 이력 조회 */
export const useExternalRiskList = (params?: ExternalRiskListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXTERNAL_RISK.LIST(params),
    queryFn: () => externalRiskApi.getAllResults(params),
  });
};

/** 특정 회사 최신 결과 조회 */
export const useExternalRiskLatest = (companyId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXTERNAL_RISK.LATEST(companyId),
    queryFn: () => externalRiskApi.getLatestResult(companyId),
    enabled: companyId > 0,
  });
};

/** 리스크 분석 요청 (POST) */
export const useDetectRisk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: externalRiskApi.detectRisk,
    onSuccess: () => {
      toast.success('외부 리스크 분석이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['externalRisk'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const code = error.response?.data?.code;
      if (code === 'RISK002') {
        toast.error('AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      } else if (code === 'RISK004') {
        toast.error('리스크 분석 권한이 없습니다.');
      } else {
        handleApiError(error);
      }
    },
  });
};
