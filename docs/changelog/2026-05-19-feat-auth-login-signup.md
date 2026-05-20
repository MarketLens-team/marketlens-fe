# Change Log — 2026-05-19 · feat/auth-login-signup

브랜치 `feat/auth-login-signup`에서 진행한 **로그인·회원가입 UI 및 가입 온보딩(관심 종목 → 알림 설정) 통합** 작업 기록입니다.  
월별 파일(`2026-05.md`)보다 이 문서가 브랜치 단위 진입점입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/auth-login-signup` |
| 작업일 | 2026-05-15 ~ 2026-05-19 |
| 베이스 | `develop` (design-tokens #10 머지 이후) |
| 관련 PR | [#11](https://github.com/MarketLens-team/marketlens-fe/pull/11) |
| 머지 | `1d2bdba` — `develop` |

## 요약

`/login` 단일 화면에 **탭형 로그인·회원가입**을 두고, 회원가입은 **계정 → 관심 종목 → 알림 설정** 3단계를 `AuthPanel` 카드 안에서 진행합니다. 가입 완료 시 `signup → login → watchlist → alert settings`를 `completeRegistration`으로 일괄 호출합니다. 별도 `/onboarding/*` 라우트는 제거했습니다.

## Added

### 인증 UI

- `src/components/auth/AuthPanel.tsx` — 로그인·회원가입 탭, `signupStep` 1\|2\|3, `AuthField` export
- `src/components/auth/SignupWatchlistStep.tsx` — 종목 검색·칩 선택(최대 10), 초기화, 건너뛰기/다음
- `src/components/auth/SignupAlertsStep.tsx` — 알림 옵션, 커스텀 체크박스, **MarketLens 시작하기** CTA
- `src/components/auth/AuthPasswordVisibilityToggle.tsx`
- 카드 폭: 2단계 `cardExpanded` 720px, 3단계 `cardAlerts` 480px
- 진행 바: `--color-primary`; 관심 종목 칩: `--color-interactive-active` / `--color-interactive-hover`
- 제출 버튼 로딩: `ButtonSpinner`

### API·데이터

- `src/data/clients/authClient.ts` — `loginWithCredentials`, `signupWithCredentials`
- `src/data/clients/completeRegistration.ts` — 가입 완료 일괄 처리
- `src/data/clients/stockClient.ts`, `watchlistClient.ts`, `memberClient.ts` — 종목·워치리스트·알림
- `src/data/util/apiError.ts`, `src/data/constants/errorCodes.ts` — 백엔드 `ErrorCode` 매핑
- `vite.config.ts` — dev proxy `/api` → `VITE_API_URL` (기본 `http://localhost:8081`)
- `.env.example` — 로컬 API 포트 8081 예시

### 토큰 (에러·인터랙션)

| 토큰 | 용도 |
|------|------|
| `--color-danger-muted` | invalid input 테두리·메시지 |
| `--color-danger-surface` | 에러 배경(필요 시) |
| `--color-interactive-active` / `-hover` | 관심 종목 칩 선택·호버 |

## Changed

- **로그인** — 즉시 API 호출; 실패 시 상단 배너 대신 필드 강조 + 비밀번호 아래 한 줄 메시지
- **유효성** — 이메일 blur 형식 검증; 입력 미완료 시 로그인·회원가입 제출(다음) 버튼 비활성
- **회원가입 에러** — 이메일 중복(`A001` 등) → 1단계 `errors.email`; 3단계 기타 오류 → CTA 위 `signupSubmitError`
- **폼 레이아웃** — `.form { gap: var(--space-4) }`, submit 위 여백으로 필드 간격과 버튼 간격 통일
- **관심 종목 단계** — 「이전」 제거, 푸터 우측 정렬·단일 건너뛰기/다음, 초기화 버튼
- **알림 단계** — 「이전」 제거, 좁은 카드, 커스텀 체크박스
- **personClient** — `ApiResponse` unwrap 및 DTO 매핑 수정 (`cfc9c6d`)
- **탭 타이포** — 로그인·회원가입 탭 `--font-size-3xl`

## Removed

- `/onboarding/*` 라우트 및 온보딩 전용 페이지·`OnboardingShell`
- 로그인 **비밀번호 찾기** 링크·재설정 UI (백엔드 재설정 메일 미지원)
- 회원가입 상단 `formBanner` 위주 에러 (필드·인라인 메시지로 대체)
- 관심 종목 요약 칩 체크마크, 「잘하셨어요」 푸터 문구

## 의도적으로 하지 않음 (후속)

- 비밀번호 찾기·재설정 메일 API 연동
- 로그인 후 `onboardingCompleted` — `GET /api/members/me` 등으로 확장 가능
- 로그인 상태 비밀번호 변경 UI (`PUT /api/members/me/password`는 백엔드 존재)

## 환경 변수

```env
VITE_API_URL=http://localhost:8081
VITE_USE_MOCK_DATA=false
```

`npm run dev` 재시작 후 프록시 적용.

## 커밋 (시간순, 머지 제외)

1. `c4ca826` — 로컬 API 8081 `.env.example`
2. `3d6ea1b` — 탭형 로그인·회원가입 UI 및 auth API 연동
3. `6d9a74d` — 탭 글자 크기 3xl
4. `575d699` — font-size 3xl·4xl 스케일 (토큰)
5. `33c53ee` — 백엔드 login·signup 연동
6. `00a5705` — 제출 버튼 원형 로딩 스피너
7. `cfc9c6d` — person API ApiResponse 파싱
8. `40cf759` — 관심 종목·알림 온보딩 컴포넌트
9. `2f2ed94` — `/login` AuthPanel 3단계 통합, `/onboarding` 제거
10. `7282a17` — 관심 종목 푸터·초기화 UX
11. `0970831` — 알림 단계 UI·커스텀 체크박스
12. `4a5d0eb` — 에러 UI·제출 버튼 활성화 조건
13. `0ec1da7` — 폼 세로 간격·비밀번호 찾기 링크 제거

## 확인

```bash
npm run lint
npm run build
```

- [ ] `/login` 로그인 성공 → 홈(또는 admin) 리다이렉트
- [ ] 잘못된 자격 증명 → input 강조 + 메시지
- [ ] 이메일 blur 형식 검증
- [ ] 회원가입 1→2→3 완료 → 로그인·워치리스트·알림 반영
- [ ] 관심 종목 0개 건너뛰기 후 가입 완료
- [ ] 중복 이메일 → 1단계 이메일 필드 에러
- [ ] `VITE_USE_MOCK_DATA=true` 목 모드
- [ ] 백엔드 8081 + proxy, Network Error 없음
