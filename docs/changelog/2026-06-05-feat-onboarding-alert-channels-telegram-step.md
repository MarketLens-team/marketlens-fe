# Change Log — 2026-06-05 · feat · 온보딩 알림 채널·텔레그램 연동 3단계

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | `/onboarding` — 알림 설정(2단계) · 텔레그램 연동(3단계) |

## 요약

회원가입 온보딩 알림 설정에 이메일·텔레그램 수신 채널 체크박스를 추가했다. 텔레그램 알림 ON 시 가입 완료(JWT 발급) 직후 3단계에서 `tg://` 연동을 진행하고, OFF 시 바로 홈으로 이동한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `SignupAlertsStep` | 알림 종류 3체크만 | **수신 채널**(이메일·텔레그램) + **알림 종류** |
| 온보딩 단계 | 2단계(관심종목 → 알림) | 텔레그램 ON 시 **3단계 연동** 추가 |
| 가입 완료 후 | `handleCompleteRegistration` → 즉시 홈 | 텔레그램 ON: 3단계 유지 · OFF: 홈 |
| 로그인 리다이렉트 버그 | JWT 저장 직후 `phase=alerts`에서 홈으로 튕김 | `setPhase('telegram')`을 **가입 API 전**에 실행 |

## 파일

- `src/components/auth/SignupAlertsStep.tsx` · `.module.css`
- `src/components/auth/SignupTelegramLinkStep.tsx` · `.module.css`
- `src/pages/OnboardingPage.tsx` · `.module.css`

## 확인

- 텔레그램 알림 ON → MarketLens 시작하기 → 3단계 연동 UI (홈으로 안 튕김)
- 텔레그램 알림 OFF → 가입 후 바로 홈
- 3단계: 텔레그램 연동 · 나중에 하기 · 완료
