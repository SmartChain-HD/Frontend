## 요약
- 무엇을 변경했는지 한 줄 요약

## 관련 이슈
- Closes #

## 변경 내용
- [ ] UI (Figma 기반)
- [ ] API 연동 (react-query + axios)
- [ ] 라우팅/구조
- [ ] 리팩터링/성능/테스트
- [ ] 문서 업데이트

## 스크린샷 / 데모
| Before | After |
|---|---|
|  |  |

## 구현 메모
### Figma
- Frame/Section 링크:
- 구현 범위(In/Out):

### API (SSOT 준수)
- Endpoint:
- Response: `BaseResponse<T>` unwrap 방식 적용 여부
- Error: `ErrorResponse` + 401(A002 refresh+retry / 그 외 /login) 준수 여부

### React Query
- 추가/변경한 QUERY_KEYS:
- Invalidate 전략:

## 테스트
- [ ] `pnpm lint` / `npm run lint`
- [ ] `pnpm build` / `npm run build`
- [ ] 주요 플로우 수동 테스트 완료 (아래 체크)
  - [ ] 로딩/빈값/에러 상태 확인
  - [ ] 토큰 만료(401) 시 동작 확인(가능한 범위)

## 체크리스트
- [ ] fetch/axios 직접 호출 없음(규칙상 apiClient/훅 사용)
- [ ] 타입 any 남발 없음 / 공용 타입 사용
- [ ] 재사용 컴포넌트는 src/components로 분리(2회 이상)
- [ ] 문서/주석의 TODO는 명확함(엔드포인트 미확정 등)

## 리뷰어에게
- 중점적으로 봐줬으면 하는 부분:
