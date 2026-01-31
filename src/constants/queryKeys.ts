export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  DIAGNOSTICS: {
    LIST: (params?: object) => ['diagnostics', 'list', params] as const,
    DETAIL: (id: number) => ['diagnostics', 'detail', id] as const,
    HISTORY: (id: number) => ['diagnostics', 'history', id] as const,
  },
  APPROVALS: {
    LIST: (params?: object) => ['approvals', 'list', params] as const,
    DETAIL: (id: number) => ['approvals', 'detail', id] as const,
  },
  REVIEWS: {
    DASHBOARD: ['reviews', 'dashboard'] as const,
    LIST: (params?: object) => ['reviews', 'list', params] as const,
    DETAIL: (id: number) => ['reviews', 'detail', id] as const,
  },
  ROLES: {
    REQUEST_PAGE: ['roles', 'requestPage'] as const,
    MY_REQUESTS: ['roles', 'myRequests'] as const,
    APPROVAL_LIST: (params?: object) => ['roles', 'approvalList', params] as const,
  },
  MANAGEMENT: {
    PERMISSIONS_DASHBOARD: ['management', 'permissionsDashboard'] as const,
    USERS: (params?: object) => ['management', 'users', params] as const,
    COMPANIES: ['management', 'companies'] as const,
    ACTIVITY_LOGS: (params?: object) => ['management', 'activityLogs', params] as const,
  },
  NOTIFICATIONS: {
    LIST: (params?: object) => ['notifications', 'list', params] as const,
  },
  AI_RUN: {
    RESULT: (diagnosticId: number) => ['aiRun', 'result', diagnosticId] as const,
    RESULT_DETAIL: (diagnosticId: number) => ['aiRun', 'resultDetail', diagnosticId] as const,
    HISTORY: (diagnosticId: number) => ['aiRun', 'history', diagnosticId] as const,
  },
  JOBS: {
    STATUS: (jobId: string) => ['jobs', 'status', jobId] as const,
  },
  FILES: {
    PARSING_RESULT: (diagnosticId: number, fileId: number) =>
      ['files', 'parsingResult', diagnosticId, fileId] as const,
  },
} as const;
