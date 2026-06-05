# Change Log — 2026-06-05 · fix · AuthSessionGate pathname마다 ensureAccessToken

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/auth-session-gate-token-check` |
| 커밋 | (커밋 후 갱신) |

## 요약

`AuthSessionGate`가 `location.pathname` 변경마다 `ensureAccessToken()`을 호출하던 문제를 앱 마운트 1회로 제한했다. 이후 토큰 갱신은 api 요청 인터셉터·401 재시도가 담당한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `AuthSessionGate` ensureAccessToken | 라우트 이동마다 실행 | 앱 최초 마운트 1회 |
| 페이지 이동 시 reissue 시도 | pathname effect마다 JWT 검사·임박 시 refresh | 불필요한 선제 검사 제거 |

## 파일

- `src/components/common/AuthSessionGate.tsx`

## 확인

- [ ] 로그인 유지 중 페이지 이동 — Network reissue 불필요 호출 없음
- [ ] 앱 새로고침·만료 임박 토큰 — 선제 reissue 정상
- [ ] API 401 시 refresh·로그아웃 흐름 유지
- [ ] `npm run lint:js` · `npm run build` 통과

## 제외 (후속)

- `PrivateRoute` pathname마다 `ensureAccessToken` — 별도 PR
- `useDashboardAnomalySummary` 인스턴스 lift — 별도 PR
