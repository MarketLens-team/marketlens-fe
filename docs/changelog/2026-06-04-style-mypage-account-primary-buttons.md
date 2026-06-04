# Change Log — 2026-06-04 · style · 계정 설정 primary 버튼·텔레그램 아이콘

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage?tab=account` |

## 요약

계정 설정 탭의 텔레그램 연동·비밀번호 변경 버튼을 로그인 CTA와 동일한 primary 톤으로 맞추고, 텔레그램 연동 버튼에 브랜드 아이콘을 추가했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| ActionButton | default variant만 | `primary` variant 추가 (로그인 버튼과 동일 토큰) |
| 텔레그램 연동 버튼 | 보조 톤 | `primary` + `TelegramIcon` |
| 비밀번호 변경 버튼 | 보조 톤 | `primary` |

## 파일

- `src/components/ui/ActionButton.tsx`
- `src/components/ui/ActionButton.module.css`
- `src/components/ui/TelegramIcon.tsx`
- `src/components/mypage/MyPageTelegramLink.tsx`
- `src/components/mypage/MyPageTelegramLink.module.css`
- `src/components/mypage/MyPagePasswordChange.tsx`

## 확인

- 계정 설정 탭에서 두 버튼이 로그인 화면 primary CTA와 같은 파란 톤
- 텔레그램 연동 버튼 좌측에 Telegram 아이콘 표시
