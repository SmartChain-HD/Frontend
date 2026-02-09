/**
 * AI 분석 결과 사유(reason) 코드 → 한글 라벨 매핑
 * 서버에서 내려오는 reason 코드를 사용자에게 표시할 때 사용
 */
export const REASON_LABELS: Record<string, string> = {
  // 공통 사유 (Common)
  MISSING_SLOT: '필수 슬롯 누락',
  HEADER_MISMATCH: '필수 헤더 누락',
  EMPTY_TABLE: '표/데이터 행이 비어있음',
  DATE_MISMATCH: '제출 기간 범위 밖 데이터',
  SIGNATURE_MISSING: '확인 서명란 미기재',
  OCR_FAILED: '문서 판독 불가',
  LLM_ANOMALY_DETECTED: 'AI 문서 이상 징후 감지',
  LLM_MISSING_FIELDS: 'AI 누락 항목 감지',
  VIOLATION_DETECTED: 'AI 안전 위반 사항 감지',

  // 교차 검증 (Cross Validation)
  CROSS_HEADCOUNT_MISMATCH: '출석부와 사진 인원수 불일치',
  CROSS_ATTENDANCE_PARSE_FAILED: '출석부 인원 추출 실패',
  CROSS_PHOTO_COUNT_FAILED: '사진 인원 감지 실패',

  // 안전(Safety) 특정 사유
  LOW_EDUCATION_RATE: '교육 이수율 기준 미달',
  EDU_DEPT_ZERO: '특정 부서 이수율 0%',
  RISK_ACTION_MISSING: '위험성평가 조치 내용 누락',
};
