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

  // Permission
  PERM_001: { action: 'toast' },
  PERM_002: { action: 'toast' },
  PERM_003: { action: 'toast', customMessage: '이미 처리된 요청입니다. 새로고침 해주세요.' },

  // Domain
  DOM002: { action: 'toast', customMessage: '해당 도메인에 대한 권한이 없습니다' },

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

  // Server
  S001: { action: 'toast', customMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },

  // Review
  RV001: { action: 'toast', customMessage: '심사 건을 찾을 수 없습니다.' },

  // AI
  AI001: { action: 'toast', customMessage: 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' },
  AI002: { action: 'toast', customMessage: '이미 분석이 진행 중입니다. 완료 후 다시 시도해주세요.' },
  AI003: { action: 'toast', customMessage: 'AI 분석 결과가 없습니다. 먼저 분석을 요청해주세요.' },
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
