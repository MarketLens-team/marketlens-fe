# Change Log — 2026-05-21 · feat/design-refresh (인증·로그인 모달)

브랜치 `feat/design-refresh`에서 진행한 **탑 네비 로그인 모달·회원가입 이메일 OTP·비밀번호 찾기·로그인/로그아웃 리다이렉트** 작업 기록입니다.  
초기 3단계 가입 UI 베이스는 [2026-05-19-feat-auth-login-signup.md](./2026-05-19-feat-auth-login-signup.md)를 참고합니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-21 |
| 백엔드 (참고) | `marketlens_backend` — 이메일 인증·pending signup·password-reset API |
| 선행 UI | 검색 모달 서피스 토큰 — [search-modal changelog](./2026-05-21-feat-design-refresh-search-modal.md) |

### 프론트 커밋 (`feat/design-refresh`, 시간순)

| 해시 | 요약 |
|------|------|
| `5770d1c` | feat: 탑 네비 로그인 모달·온보딩 페이지 분리 및 공개 라우팅 정리 |
| `f7c87fd` | feat: 회원가입 이메일·닉네임 인증 및 OTP 모달 연동 |
| `62ff4e0` | fix: 이메일 인증 우선·인증 전 나머지 필드 비활성화 |
| `054da0c` | fix: 회원가입 API 검증 오류를 해당 필드 아래에 표시 |
| `c954014` | fix: 로그인 모달 상단 여백·닫기 버튼 레이아웃 정리 |
| `cd2c99c` | style: 로그인·인증 모달 색상을 검색 모달 토큰과 통일 |
| `5838fb5` | style: 로그인 모달 입력 필드 대비·비활성 상태 정리 |
| `2f9d021` | fix: 로그인 실패 메시지가 이메일 형식 오류로 바뀌던 문제 수정 |
| `5ab6d1d` | feat: 로그인·로그아웃 후 리다이렉트 처리 통일 |
| `5bf00a1` | fix: 로그아웃 시 인증 필요 페이지 이동·공개 페이지 데이터 재요청 |
| `684bc07` | style: 회원가입 필드 완료 상태 문구 초록색 강조 |
| `9ebabf4` | feat: 비밀번호 찾기 플로우(이메일 인증·재설정) 추가 |

세션·refresh token 상세는 [auth-session changelog](./2026-05-21-feat-design-refresh-auth-session.md)를 참고합니다.

## 요약

1. **로그인 진입점** — `/login` 전용 페이지 대신 탑 네비 **로그인 모달**(`AuthLoginModal`); 회원가입 1단계 후 **`/onboarding`**(관심종목·알림) 분리.
2. **회원가입 인증** — 이메일 중복 확인 + `SIGNUP` OTP 모달 → 인증 전 닉네임·비밀번호 비활성 → `pending` → 온보딩 → `complete`.
3. **비밀번호 찾기** — 로그인 탭 「비밀번호를 잊으셨나요?」 → `PASSWORD_RESET` OTP → 새 비밀번호 → `POST /api/auth/password-reset`.
4. **세션 UX** — 로그인 후 `from`/현재 경로/역할 기반 리다이렉트; 로그아웃 시 인증 필요 경로만 `/`, 공개 페이지는 `useAsyncData`가 `authToken` 변경으로 재요청.
5. **에러·스타일** — API 필드 오류 인라인 표시, 로그인 실패 문구 보호, 모달 색상·입력 대비 검색 모달 토큰과 통일.

---

## Added

### 탑 네비 로그인 모달 (`5770d1c`)

| 경로 | 역할 |
|------|------|
| `src/components/auth/AuthLoginModal.tsx` | `authModalStore` 기반 로그인·회원가입 1단계 모달 |
| `src/store/authModalStore.ts` | `open` / `close` / `mode` |
| `src/pages/OnboardingPage.tsx` | 회원가입 2·3단계(관심종목·알림), `SignupAccountDraft` 수신 |
| `src/hooks/useAuthFlow.ts` | `handleLogin` / `handleLogout` / `handleCompleteRegistration` |
| `src/components/common/TopNavActions.tsx` | 로그인 버튼 → 모달 오픈 |

- `AuthPanel` — `presentation: 'modal'`, `scope: 'account-only'`(모달) vs `full`(`/login` 직접 접근)
- 라우터: `/onboarding` 공개, `PrivateRoute`·인증 진입 경로 정리

### 이메일 OTP · 회원가입 API (`f7c87fd`, `62ff4e0`, `054da0c`)

| 경로 | 역할 |
|------|------|
| `src/components/auth/AuthEmailVerifyModal.tsx` | OTP 모달 셸 (`z-overlay-stacked`) |
| `src/components/auth/AuthEmailVerifyStep.tsx` | 6자리 입력·1분 재발송 쿨다운 |
| `src/components/auth/OtpCodeInput.tsx` | OTP 입력 UI |
| `src/hooks/useResendCooldown.ts` | 재발송 60초 타이머 |
| `src/data/clients/authClient.ts` | `checkEmail` / `checkNickname` / `sendEmailVerification` / `confirm` / `pending` / `complete` |

#### 백엔드 API 연동

| API | 용도 |
|-----|------|
| `GET /api/auth/check-email` | 회원가입 이메일 중복 |
| `GET /api/auth/check-nickname` | 닉네임 중복 |
| `POST /api/auth/email-verifications` | 인증 메일 (`purpose`: `SIGNUP` \| `PASSWORD_RESET`) |
| `POST /api/auth/email-verifications/confirm` | OTP 6자리 확인 |
| `POST /api/auth/signup/pending` | 이메일 인증 후 세션 토큰 |
| `POST /api/auth/signup/complete` | 온보딩 완료 후 JWT |

#### 회원가입 1단계 UX

- 이메일 필드 **「인증」** 인라인 버튼 — 중복 확인 + 메일 발송 일괄
- 인증 완료 전 **닉네임·비밀번호·확인 필드 `disabled`**
- 닉네임 **「중복 확인」** → `available` 시 「사용 가능」
- 「다음」 → `createPendingSignup` → `/onboarding` (`onSignupAccountNext`)

Mock: OTP **`000000`**, 닉네임 `admin` 중복, 이메일에 `taken` 포함 시 중복.

### 비밀번호 찾기 (`9ebabf4`)

#### 플로우 (`AuthPanel` `loginPhase`)

| 단계 | UI |
|------|-----|
| `signin` | 로그인 폼 + 「비밀번호를 잊으셨나요?」 |
| `forgot-email` | 이메일 + 「인증」 → OTP 모달 (`PASSWORD_RESET`) |
| `forgot-password` | 새 비밀번호·확인 → 「비밀번호 변경」 |

| API | 용도 |
|-----|------|
| `POST /api/auth/email-verifications` | `purpose: PASSWORD_RESET` |
| `POST /api/auth/email-verifications/confirm` | OTP 확인 |
| `POST /api/auth/password-reset` | `{ email, newPassword }` (인증 완료 후) |

- 미가입 이메일 → 「존재하지 않는 회원입니다」(`M001`)
- 성공 → 로그인 탭 복귀 + 「비밀번호가 변경되었습니다…」 성공 배너

`AuthEmailVerifyModal` / `AuthEmailVerifyStep` — `purpose` prop으로 회원가입·재설정 공용.

---

## Changed

### 로그인·로그아웃 리다이렉트 (`5ab6d1d`, `5bf00a1`)

#### `useAuthFlow.ts`

- **로그인 후** — `location.state.from` → 현재 경로(`?` 포함) → 역할 기본(`ADMIN` → `/admin`, `USER` → `/`)
- `/login`, `/onboarding` 은 리다이렉트 대상에서 제외
- **로그아웃** — `PRIVATE_PATH_PREFIXES` (`/watchlist`, `/mypage`, `/admin`) 일 때만 `navigate('/')`
- 공개 페이지(홈·종목 상세 등)는 URL 유지; `useAsyncData` deps에 `authToken` 포함으로 **재fetch**

### API 오류 표시 (`2f9d021`, `054da0c`)

#### `apiError.ts`

- `isPreservedApiMessage` — 「이메일 또는 비밀번호…」 등 로그인 실패 문구는 필드 매핑·치환에서 **제외**
- `parseApiFieldError` — `email` / `nickname` / `password` 필드 아래 인라인 메시지

### 모달·폼 스타일 (`c954014`, `cd2c99c`, `5838fb5`, `684bc07`)

- `AuthLoginModal` — overlay `align-items: flex-start`, 상단 여백
- `Modal.headerCloseOnly` — 닫기만 있을 때 빈 헤더 제거
- 로그인·OTP 모달 — `--color-bg-modal`, `--color-bg-modal-inset` (검색 모달과 동일)
- `AuthPanel.cardInModal` — 입력·비활성 대비
- `.fieldActionDone` — 「인증 완료」「사용 가능」 → `--color-success`

---

## Removed / 의도적 변경

- [2026-05-19 changelog](./2026-05-19-feat-auth-login-signup.md)에서 제거했던 **비밀번호 찾기** UI를 백엔드 `PASSWORD_RESET` API와 함께 **재도입** (`9ebabf4`).
- `/login`은 유지하나 주 진입점은 **탑 네비 모달**; 전체 3단계 가입은 `/login?mode=signup` 또는 모달 회원가입 탭 → `/onboarding`.

---

## 환경 변수

```env
VITE_API_URL=http://localhost:8081
VITE_USE_MOCK_DATA=false
```

Mock 모드(`VITE_USE_MOCK_DATA=true`) 시 OTP `000000`, password-reset·login 모두 지연 후 성공.

---

## 확인

```bash
npm run dev
# 1. 탑 네비 로그인 → 회원가입: 이메일 인증 → 닉네임/비밀번호 → /onboarding
# 2. 비밀번호 찾기: 이메일 인증 → 새 비밀번호 → 로그인
# 3. /watchlist 등에서 로그아웃 → / ; 종목 상세에서 로그아웃 → 페이지 유지·데이터 갱신
```

---

## 관련 파일 (핵심)

```
src/components/auth/
  AuthLoginModal.tsx
  AuthPanel.tsx
  AuthEmailVerifyModal.tsx
  AuthEmailVerifyStep.tsx
src/data/clients/authClient.ts
src/data/util/apiError.ts
src/hooks/useAuthFlow.ts
src/hooks/useAsyncData.ts
src/store/authModalStore.ts
src/pages/OnboardingPage.tsx
```
