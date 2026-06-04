# Change Log — 2026-06-04 · feat · 마이페이지 텔레그램 연동·비밀번호 변경

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage?tab=account` |

## 요약

계정 설정 탭에 텔레그램 딥링크 연동과 이메일 OTP 기반 비밀번호 변경을 추가했다. 비밀번호 변경은 로그인 화면 비밀번호 찾기와 동일한 auth API 흐름을 사용한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 텔레그램 연동 | 없음 | `POST /api/members/me/telegram-link-token` → `t.me/{bot}?start={token}` 새 탭 |
| 비밀번호 변경 UI | 없음 | 버튼 → OTP 모달 → 새 비밀번호 모달 |
| 비밀번호 변경 API | (초기) `PUT /api/members/me/password` | `POST /api/auth/password-reset` + `PASSWORD_RESET` OTP |
| OTP 발송 UX | 버튼 로딩 / 빈 모달 로딩 | 모달 먼저 열고 내부에서 발송·로딩 표시 |
| OTP UI | — | `AuthEmailVerifyStep` 재사용 (`MyPagePasswordVerifyModal`) |

## API 흐름

### 텔레그램 연동

1. `POST /api/members/me/telegram-link-token` (JWT)
2. `https://t.me/marketlens_noti_bot?start={token}` (`VITE_TELEGRAM_BOT_USERNAME`로 override 가능)

### 비밀번호 변경

1. `POST /api/auth/email-verifications` — `purpose: PASSWORD_RESET`
2. `POST /api/auth/email-verifications/confirm` — OTP 6자리
3. `POST /api/auth/password-reset` — `{ email, newPassword }`

## 파일

- `src/components/mypage/MyPageTelegramLink.tsx` · `.module.css`
- `src/components/mypage/MyPagePasswordChange.tsx` · `.module.css`
- `src/components/mypage/MyPagePasswordVerifyModal.tsx` · `.module.css`
- `src/components/mypage/MyPagePasswordChangeModal.tsx` · `.module.css`
- `src/hooks/useTelegramLink.ts` · `usePasswordReset.ts`
- `src/data/clients/memberClient.ts` — `issueTelegramLinkToken`
- `src/lib/buildTelegramBotStartUrl.ts` · `src/constants/telegram.ts`
- `src/pages/MyPage.tsx`
- `.env.example` — `VITE_TELEGRAM_BOT_USERNAME`

## 확인

- 계정 설정 탭: 텔레그램 연동 버튼 → 새 탭 딥링크 + 스낵바 안내
- 비밀번호 변경: 버튼 → 모달 내 메일 발송 로딩 → OTP 입력 → 새 비밀번호 저장
- 백엔드 SMTP(`MAIL_PASSWORD`) 미설정 시 메일 500 가능 — Redis OTP로 로컬 우회 가능
