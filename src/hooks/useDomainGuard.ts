import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { DomainCode } from '../types/api.types';

const VALID_DOMAIN_CODES: DomainCode[] = ['ESG', 'SAFETY', 'COMPLIANCE'];

interface UseDomainGuardOptions {
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
}

interface UseDomainGuardResult {
  /** URL에서 가져온 domainCode (검증 전) */
  rawDomainCode: DomainCode | null;
  /** 검증된 domainCode (권한 있는 경우에만) */
  validatedDomainCode: DomainCode | undefined;
  /** 사용자가 접근 가능한 도메인 목록 */
  accessibleDomains: DomainCode[];
  /** 현재 domainCode에 대한 접근 권한 여부 */
  hasAccess: boolean;
  /** 유효하지 않은 domainCode인지 여부 */
  isInvalidDomainCode: boolean;
}

/**
 * URL의 domainCode 쿼리 파라미터를 검증하고 사용자 권한을 체크하는 훅
 *
 * @param options.redirectOnUnauthorized - 권한 없을 때 리다이렉트 여부 (기본: true)
 * @param options.redirectPath - 리다이렉트 경로 (기본: '/permission/request')
 */
export function useDomainGuard(options: UseDomainGuardOptions = {}): UseDomainGuardResult {
  const { redirectOnUnauthorized = true, redirectPath = '/permission/request' } = options;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasDomainAccess, getAccessibleDomains } = useAuthStore();

  const rawDomainCode = searchParams.get('domainCode') as DomainCode | null;
  const accessibleDomains = getAccessibleDomains();

  const isInvalidDomainCode = useMemo(() => {
    if (!rawDomainCode) return false;
    return !VALID_DOMAIN_CODES.includes(rawDomainCode);
  }, [rawDomainCode]);

  const hasAccess = useMemo(() => {
    if (!rawDomainCode) return true; // 도메인 지정 안 함 = 전체 조회
    if (isInvalidDomainCode) return false;
    return hasDomainAccess(rawDomainCode);
  }, [rawDomainCode, isInvalidDomainCode, hasDomainAccess]);

  const validatedDomainCode = useMemo(() => {
    if (!rawDomainCode || isInvalidDomainCode || !hasAccess) {
      return undefined;
    }
    return rawDomainCode;
  }, [rawDomainCode, isInvalidDomainCode, hasAccess]);

  useEffect(() => {
    if (redirectOnUnauthorized && rawDomainCode && !hasAccess) {
      navigate(redirectPath, { replace: true });
    }
  }, [redirectOnUnauthorized, rawDomainCode, hasAccess, navigate, redirectPath]);

  return {
    rawDomainCode,
    validatedDomainCode,
    accessibleDomains,
    hasAccess,
    isInvalidDomainCode,
  };
}

/**
 * 도메인 필터 옵션을 생성하는 유틸리티 훅
 * 사용자가 접근 가능한 도메인만 필터 옵션으로 반환
 */
export function useAccessibleDomainOptions() {
  const { getAccessibleDomains } = useAuthStore();
  const accessibleDomains = getAccessibleDomains();

  const domainOptions = useMemo(() => {
    const DOMAIN_LABELS: Record<DomainCode, string> = {
      ESG: 'ESG 실사',
      SAFETY: '안전보건',
      COMPLIANCE: '컴플라이언스',
    };

    return accessibleDomains.map((code: DomainCode) => ({
      value: code,
      label: DOMAIN_LABELS[code],
    }));
  }, [accessibleDomains]);

  return {
    accessibleDomains,
    domainOptions,
    hasSingleDomain: accessibleDomains.length === 1,
    hasMultipleDomains: accessibleDomains.length > 1,
  };
}
