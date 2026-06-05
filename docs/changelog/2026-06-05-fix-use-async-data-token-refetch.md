# Change Log — 2026-06-05 · fix · useAsyncData token 재발급 연쇄 refetch

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/use-async-data-auth-refetch` |
| 커밋 | `a880f8b` |

## 요약

`useAsyncData` effect 의존성이 `authToken`이라 access token 재발급(`setTokens`)마다 마운트된 모든 훅이 전역 refetch되던 문제를, `isLoggedIn` 의존으로 바꿔 로그인/로그아웃 전환 시에만 refetch 하도록 수정했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useAsyncData` refetch 트리거 | `token` 문자열 변경 (재발급 포함) | `isLoggedIn` true↔false 전환만 |
| 토큰 선제 reissue 후 | overview·prices 등 연쇄 재요청 | 동일 세션·동일 화면 데이터 유지 |

## 파일

- `src/hooks/useAsyncData.ts`

## 확인

- [ ] 로그인 유지 상태에서 `ensureAccessToken` / 401 reissue 후 Network에 기존 데이터 훅 재요청 없음
- [ ] 로그인 → 로그아웃 → 재로그인 시 회원/비회원 데이터 전환 정상
- [ ] `npm run lint:js` · `npm run build` 통과

## 제외 (후속)

- `useServerWatchlist` / `useNewsBookmarks` 인스턴스별 독립 fetch — 별도 PR
