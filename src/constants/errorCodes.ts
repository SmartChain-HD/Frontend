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
  R003: { action: 'toast' },

  // Not found
  U003: { action: 'redirect', redirectTo: '/not-found' },
  R002: { action: 'toast' },

  // Rate limit
  U010: { action: 'toast' },

  // Server
  S001: { action: 'toast', customMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },

  // AI
  AI001: { action: 'toast', customMessage: 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' },
  AI002: { action: 'toast', customMessage: '이미 분석이 진행 중입니다. 완료 후 다시 시도해주세요.' },
  AI003: { action: 'toast', customMessage: 'AI 분석 결과가 없습니다. 먼저 분석을 요청해주세요.' },
};
