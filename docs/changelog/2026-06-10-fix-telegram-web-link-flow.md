# Change Log — 2026-06-10 · fix · 텔레그램 Web A 연동 플로우

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | `/mypage?tab=account` · 온보딩 텔레그램 연동 단계 |

## 요약

Telegram Web `/k/#?tgaddr` 직접 진입 시 QR·봇 화면이 뜨지 않고 빈 화면만 나오던 문제를 Web A(`/a/#?tgaddr`) 한 URL(QR 로그인 + 딥링크)로 정리했다. 해제·재연동 시 `linkUrls`에 만료 토큰이 남아 「인증 코드 만료」가 반복되던 프론트 상태 버그도 함께 수정했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 데스크톱 연동 오픈 | `tg://` 딥링크(Chrome QR/앱 확인) | `web.telegram.org/a/#?tgaddr=...` (QR + 봇 딥링크) |
| Web 폴백 URL | `/k/#?tgaddr` 단일 `webClient` | `webLogin`(QR만) · `webBot`(딥링크) · `t.me` 분리 |
| assist 탭 | 모바일에서만 호출(데스크톱 null) | 데스크톱에서 클릭 직후 blank 탭 → 토큰 후 `location.replace` |
| `linkUrls` | 해제 후에도 이전 토큰 링크 유지 | 연동 시작·해제 성공 시 `null`로 초기화 |

## 파일

- `src/lib/buildTelegramBotStartUrl.ts`
- `src/hooks/useTelegramLink.ts`
- `src/components/mypage/MyPageTelegramLink.tsx`
- `src/components/auth/SignupTelegramLinkStep.tsx`

## 확인

- 마이페이지 **텔레그램 연동** 클릭 → 새 탭에 Telegram Web A QR(또는 로그인 후 봇 채팅)
- 연동 해제 후 폴백 링크가 바로 사라지고, 재연동 시 새 토큰 링크만 표시
- DevTools `POST /api/members/me/telegram-link-token` 200 후 봇 `/start {토큰}` 시 연동 완료
- 토큰 발급 API와 Telegram 웹훅이 **동일 Redis**(배포 API 기준)인 환경에서 테스트
