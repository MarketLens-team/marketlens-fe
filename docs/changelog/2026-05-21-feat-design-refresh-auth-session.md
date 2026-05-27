# Change Log — 2026-05-21 · feat/design-refresh (세션·Refresh Token)

브랜치 `feat/design-refresh`에서 진행한 **refresh token 저장·reissue·401 재시도·SPA 세션 복구·로그인 복귀 리다이렉트** 작업 기록입니다.  
로그인 모달·OTP·비밀번호 찾기 베이스는 [2026-05-21-feat-design-refresh-auth.md](./2026-05-21-feat-design-refresh-auth.md)를 참고합니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-21 |
| 백엔드 (참고) | `POST /api/auth/reissue`, `POST /api/auth/logout` — access 1h, refresh 7d |

## 요약

1. **토큰 저장** — access(`token`), refresh(`marketlens_refresh_token`), role을 `authStore`에서 일괄 persist. 로그인·회원가입 완료·reissue 시 `setTokens` / `login(access, refresh, role)`.
2. **선제 reissue** — access만 없고 refresh가 있을 때 `ensureAccessToken()` — SPA **경로 변경**, **보호 라우트 진입**, **API 요청 직전**에 호출 (F5 없이 복구).
3. **401 처리** — 인증 API 제외 401 → `refreshSession()` → 원 요청 1회 재시도. 실패 시 logout + 세션 만료 UX.
4. **세션 만료 UX** — `handleSessionExpired`: `marketlens_auth_from` 저장, 홈 이동, 로그인 모달 오픈 (`AUTH_REQUIRED_EVENT`).
5. **로그아웃** — `POST /api/auth/logout` 후 클라이언트 세션 정리 (API 실패해도 로컬은 삭제).

---

## Added

| 경로 | 역할 |
|------|------|
| `src/services/reissueTokens.ts` | 인터셉터 순환 방지용 bare axios `POST /api/auth/reissue` |
| `src/services/authTokenRefresh.ts` | `refreshSession()`, `ensureAccessToken()`, in-flight dedupe |
| `src/services/authRedirect.ts` | `saveAuthRedirect` / `consumeAuthRedirect`, `pathRequiresAuth`, `handleSessionExpired` |
| `src/components/common/AuthSessionGate.tsx` | 경로 변경 시 `ensureAccessToken`, 비로그인 `openAuth`·리다이렉트 복귀 모달 |
| `src/constants/storage.ts` | `AUTH_REFRESH_TOKEN_KEY`, `AUTH_REDIRECT_KEY` |

### 백엔드 API

| API | 용도 |
|-----|------|
| `POST /api/auth/reissue` | body `{ refreshToken }` → 새 access·refresh (public) |
| `POST /api/auth/logout` | Redis refresh 삭제 (Bearer access) |

---

## Changed

### `authStore.ts`

- `refreshToken` 상태·localStorage 동기화
- `login(access, refresh, role)`, `setTokens(tokens, role?)`
- `logout` 시 refresh·role 키 함께 제거
- 빈 문자열 access는 null 처리

### `api.ts`

- **요청** — 비인증 API 직전 `ensureAccessToken()`; Authorization은 store → localStorage 순
- **응답** — 401 + refresh 보유 시 reissue 후 재시도; 최종 실패 시 `handleSessionExpired`

### `PrivateRoute.tsx`

- 리다이렉트 전 `ensureAccessToken()` 완료 대기
- 비로그인 시 `state: { from, openAuth: true }`

### `useAuthFlow.ts` / `authClient.ts` / `completeRegistration.ts`

- 로그인·가입 완료 시 refresh 저장
- 로그아웃 → `logoutSession()` API 후 `logout()`
- `consumeAuthRedirect` / `clearAuthRedirect`로 로그인 후 원래 경로 복귀

### `RootLayout.tsx`

- `AuthSessionGate` 마운트

---

## Notes

### localStorage 키

| 키 | 내용 |
|----|------|
| `token` | access JWT |
| `marketlens_refresh_token` | refresh |
| `marketlens_role` | USER \| ADMIN |
| `marketlens_auth_from` | 세션 만료·비로그인 접근 시 복귀 경로 |

### 테스트 시 주의

- DevTools에서 `token`만 삭제하면 **zustand 메모리**에 access가 남을 수 있어, reissue 없이 API가 성공하는 것처럼 보일 수 있음. **F5 후** 또는 refresh만 남긴 상태에서 **페이지 이동**으로 검증.
- 개발 기본값은 `isMockDataSource() === DEV` 이면 목 — 마이페이지·관심종목 API는 인증 없이 성공할 수 있음. 실 API 검증 시 `.env`에 `VITE_USE_MOCK_DATA=false`.
- 상단 네비 관심종목(`marketlens_watchlist`)은 **로컬 저장**이며 서버 watchlist API와 별도.

---

## 확인

```bash
npm run dev
# .env: VITE_USE_MOCK_DATA=false, VITE_API_URL=http://localhost:8081
# 1. 로그인 → LS에 token, marketlens_refresh_token 확인
# 2. token만 삭제, refresh 유지 → F5 없이 /mypage 등 이동 → Network reissue
# 3. access 만료(401) API → 자동 reissue·재시도
# 4. /watchlist 비로그인 → / + 로그인 모달, 로그인 후 from 복귀
```

---

## 관련 파일

```
src/store/authStore.ts
src/services/api.ts
src/services/authTokenRefresh.ts
src/services/reissueTokens.ts
src/services/authRedirect.ts
src/components/common/AuthSessionGate.tsx
src/router/PrivateRoute.tsx
src/hooks/useAuthFlow.ts
src/data/clients/authClient.ts
```
