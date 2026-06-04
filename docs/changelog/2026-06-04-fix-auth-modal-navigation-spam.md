# Change Log — 2026-06-04 · fix · 로그아웃 시 로그인 모달 반복 노출

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | 전역 (`AuthLoginModal`) |

## 요약

비로그인 상태에서 페이지 이동·새로고침마다 로그인 모달이 다시 열리던 문제를 수정했다. `sessionStorage`에 남은 리다이렉트 경로를 모달 오픈 조건에서 제외하고, 세션 만료 시에만 1회 표시하도록 분리했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 모달 오픈 조건 | `openAuth` · `peekAuthRedirect()` · `routeState.from` | `openAuth === true` · `AUTH_REQUIRED_EVENT` · 1회성 `AUTH_PROMPT_KEY` |
| 비로그인 401 | 항상 `handleSessionExpired()` | 로그인 이력(`wasLoggedIn`) 있을 때만 |
| 세션 만료 → 홈 | `assign('/')` 후 모달 없음 | `markAuthPromptPending()` → 마운트 시 1회 consume |

## 파일

- `src/components/common/AuthSessionGate.tsx`
- `src/services/authRedirect.ts` — `markAuthPromptPending` · `consumeAuthPromptPending`
- `src/services/api.ts`
- `src/constants/storage.ts` — `AUTH_PROMPT_KEY`

## 확인

- 비로그인으로 `/mypage` 접근 → 모달 1회 → 닫고 `/stock` 이동 → 모달 안 뜸
- 비로그인 API 401 → 모달·홈 리다이렉트 없음
- 로그인 세션 만료 → 홈 이동 후 모달 1회
