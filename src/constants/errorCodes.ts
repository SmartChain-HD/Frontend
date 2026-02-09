export type ErrorAction = 'toast' | 'redirect' | 'silent';

export interface ErrorConfig {
  action: ErrorAction;
  redirectTo?: string;
  customMessage?: string;
}

export const ERROR_HANDLERS: Record<string, ErrorConfig> = {
  // Auth
  A001: { action: 'redirect', redirectTo: '/login' },
  A002: { action: 'silent' },
  A003: { action: 'toast', customMessage: '이메일 또는 비밀번호를 확인해주세요' },
  A004: { action: 'toast' },
  A005: { action: 'toast', customMessage: '계정이 영구 잠금되었습니다. 관리자에게 문의해주세요.' },
  A006: { action: 'silent' }, // LoginPage에서 직접 처리

  // Permission
  PERM_001: { action: 'redirect', redirectTo: '/dashboard', customMessage: '해당 리소스에 대한 접근 권한이 없습니다' },
  PERM_002: { action: 'toast' },
  PERM_003: { action: 'toast', customMessage: '이미 처리된 요청입니다. 새로고침 해주세요.' },

  // Domain
  DOM002: { action: 'redirect', redirectTo: '/dashboard', customMessage: '해당 도메인에 대한 권한이 없습니다' },

  // Duplicates
  U002: { action: 'toast' },
  R003: { action: 'toast', customMessage: '이미 대기 중인 권한 요청이 있습니다.' },

  // Role errors
  R004: { action: 'toast', customMessage: '유효하지 않은 역할입니다.' },
  R005: { action: 'toast', customMessage: '유효하지 않은 처리 결과입니다. APPROVED 또는 REJECTED만 허용됩니다.' },

  // Not found
  U003: { action: 'redirect', redirectTo: '/not-found' },
  R002: { action: 'toast' },

  // Rate limit
  U010: { action: 'toast' },

  // Validation
  U001: { action: 'toast' },

  // Resource
  RES_004: { action: 'toast', customMessage: '요청한 파일을 찾을 수 없습니다.' },

  // Server
  S001: { action: 'toast', customMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
  S003: { action: 'toast', customMessage: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },

  // File
  S002: { action: 'toast', customMessage: '파일 업로드에 실패했습니다. 파일 형식 또는 크기를 확인해주세요.' },

  // Diagnostic
  D001: { action: 'redirect', redirectTo: '/not-found', customMessage: '기안을 찾을 수 없습니다.' },

  // Review
  RV001: { action: 'redirect', redirectTo: '/not-found', customMessage: '심사 건을 찾을 수 없습니다.' },

  // AI
  AI001: { action: 'toast', customMessage: 'AI 서비스 점검 중입니다. 잠시 후 다시 시도해주세요.' },
  AI002: { action: 'toast', customMessage: '이미 분석이 진행 중입니다. 완료 후 다시 시도해주세요.' },
  AI003: { action: 'toast', customMessage: 'AI 분석 결과가 없습니다. 먼저 분석을 요청해주세요.' },
  AI004: { action: 'toast', customMessage: '요청 형식 오류가 발생했습니다. 입력 데이터를 확인해주세요.' },
  AI005: { action: 'toast', customMessage: '필수 항목이 누락되었습니다. 모든 필수 항목을 제출해주세요.' },
  AI006: { action: 'toast', customMessage: '분석 시간이 초과되었습니다. 다시 시도해주세요.' },
  AI007: { action: 'toast', customMessage: 'AI 분석 요청에 실패했습니다. 파일을 확인 후 다시 시도해주세요.' },
  AI009: { action: 'toast', customMessage: '파일 처리 중입니다. 잠시 후 다시 시도해주세요.' },
  AI010: { action: 'toast', customMessage: '진단 기간을 먼저 설정해주세요.' },
};

/**
 * AI 에러 코드별 사용자 친화적 메시지 매핑
 */
export const AI_ERROR_MESSAGES: Record<string, string> = {
  AI001: 'AI 서비스 점검 중',
  AI002: '분석 진행 중',
  AI003: '분석 결과 없음',
  AI004: '요청 형식 오류',
  AI005: '필수 항목 누락',
  AI006: '분석 시간 초과',
  AI_SERVICE_UNAVAILABLE: 'AI 서비스 점검 중',
  AI_SERVICE_ERROR: '분석 중 오류 발생',
  AI_BAD_REQUEST: '요청 형식 오류',
  AI_MISSING_REQUIRED_SLOTS: '필수 항목 누락',
  AI_TIMEOUT: '분석 시간 초과',
  NETWORK_ERROR: '네트워크 연결 오류',
  ECONNABORTED: '요청 시간 초과',
  UNKNOWN: '알 수 없는 오류 발생',
};

/**
 * AI 에러 코드에서 사용자 친화적 메시지 반환
 */
export const getAiErrorMessage = (errorCode: string | undefined): string => {
  if (!errorCode) return AI_ERROR_MESSAGES.UNKNOWN;
  return AI_ERROR_MESSAGES[errorCode] || AI_ERROR_MESSAGES.UNKNOWN;
};

/**
 * AI 에러 타입 정의
 */
export type AiErrorType =
  | 'SERVICE_UNAVAILABLE'
  | 'ANALYSIS_ERROR'
  | 'BAD_REQUEST'
  | 'MISSING_SLOTS'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'UNKNOWN';

/**
 * 에러 코드를 에러 타입으로 변환
 */
export const getAiErrorType = (errorCode: string | undefined, httpStatus?: number): AiErrorType => {
  if (!errorCode && httpStatus) {
    if (httpStatus === 503) return 'SERVICE_UNAVAILABLE';
    if (httpStatus >= 500) return 'ANALYSIS_ERROR';
    if (httpStatus === 400) return 'BAD_REQUEST';
    if (httpStatus === 408) return 'TIMEOUT';
  }

  switch (errorCode) {
    case 'AI001':
    case 'AI_SERVICE_UNAVAILABLE':
      return 'SERVICE_UNAVAILABLE';
    case 'AI003':
    case 'AI_SERVICE_ERROR':
      return 'ANALYSIS_ERROR';
    case 'AI004':
    case 'AI_BAD_REQUEST':
      return 'BAD_REQUEST';
    case 'AI005':
    case 'AI_MISSING_REQUIRED_SLOTS':
      return 'MISSING_SLOTS';
    case 'AI006':
    case 'AI_TIMEOUT':
    case 'ECONNABORTED':
      return 'TIMEOUT';
    case 'NETWORK_ERROR':
    case 'ERR_NETWORK':
      return 'NETWORK';
    default:
      return 'UNKNOWN';
  }
};

/**
 * 로그인 에러 메시지 매핑
 * 에러 코드별 사용자 친화적 메시지
 */
export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  // 인증 관련 (401)
  A003: '이메일 또는 비밀번호가 일치하지 않습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 일치하지 않습니다.',

  // 사용자 없음 (404)
  U003: '등록되지 않은 계정입니다. 회원가입을 진행해주세요.',
  USER_NOT_FOUND: '등록되지 않은 계정입니다. 회원가입을 진행해주세요.',

  // 비밀번호 오류
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  U004: '비밀번호가 일치하지 않습니다.',

  // 이메일 미인증
  U007: '이메일 인증이 완료되지 않았습니다. 인증 후 다시 시도해주세요.',
  EMAIL_NOT_VERIFIED: '이메일 인증이 완료되지 않았습니다. 인증 후 다시 시도해주세요.',

  // 토큰 관련
  A001: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.',
  A002: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',

  // 계정 잠금
  A005: '계정이 영구 잠금되었습니다. 관리자에게 문의해주세요.',
  A006: '계정이 일시 잠금되었습니다.',
  ACCOUNT_LOCKED: '계정이 잠금되었습니다.',

  // 서버 오류 (500)
  S001: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  INTERNAL_ERROR: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 네트워크 오류
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  ERR_NETWORK: '네트워크 연결을 확인해주세요.',
  ECONNABORTED: '서버 응답 시간이 초과되었습니다. 다시 시도해주세요.',
  TIMEOUT: '서버 응답 시간이 초과되었습니다. 다시 시도해주세요.',

  // 기본
  UNKNOWN: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
};
