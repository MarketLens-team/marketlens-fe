# Change Log — 2026-06-05 · fix · 마이페이지 로그아웃 시 로그인 모달

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | `/mypage` → 로그아웃 |

## 요약

마이페이지에서 로그아웃하면 `PrivateRoute`가 `openAuth: true`로 홈 리다이렉트해 로그인 모달이 뜨던 문제를 수정했다. 의도적 로그아웃 가드와 홈 선이동으로 세션 만료 흐름과 구분한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `handleLogout` | `logout()` 후 navigate | `beginIntentionalLogout()` → 홈 이동 → `logout()` |
| `PrivateRoute` | 비로그인 시 항상 `openAuth: true` | 의도적 로그아웃이면 state 없이 `/` |
| 401 인터셉터 | 세션 만료 처리 | 의도적 로그아웃 중 `handleSessionExpired` 스킵 |
| `AuthSessionGate` | 비로그인 시 모달 오픈 | 의도적 로그아웃 중 스킵 |

## 파일

- `src/services/authRedirect.ts` — `beginIntentionalLogout` · `clearAuthPromptPending`
- `src/hooks/useAuthFlow.ts`
- `src/router/PrivateRoute.tsx`
- `src/components/common/AuthSessionGate.tsx`
- `src/services/api.ts`

## 확인

- [ ] 마이페이지 로그아웃 → 홈만, 로그인 모달 없음
- [ ] 세션 만료(401) → 기존처럼 로그인 모달 유도
