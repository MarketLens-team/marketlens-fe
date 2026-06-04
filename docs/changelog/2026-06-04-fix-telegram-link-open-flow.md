# Change Log — 2026-06-04 · fix · 텔레그램 연동 링크 오픈 흐름

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage?tab=account` · 텔레그램 연동 |

## 요약

데스크톱에서 `t.me`만으로는 Telegram 앱 미설치 시 START BOT이 동작하지 않는 문제를 해결했다. `tg://` 앱 딥링크·Telegram Web(`web.telegram.org`) 폴백·재오픈 링크를 추가하고, Chrome 사용자 제스처 유지를 위해 토큰 요청 전 assist 탭을 연다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 링크 오픈 | `t.me/{bot}?start={token}` 새 탭만 | 데스크톱: assist 탭 → `tg://` 시도 → `t.me` 폴백 |
| 앱 미설치 | START BOT 무반응 | Telegram Web `tgaddr` 딥링크 + UI 재오픈 링크 |
| 클릭 제스처 | `await` 후 `window.open` → Chrome 차단 | `openTelegramAssistWindow()`를 API 호출 **전**에 실행 |
| URL 빌더 | `buildTelegramBotStartUrl` 단일 | Web·App·WebClient URL + `openTelegramBotLink` 헬퍼 |

## 파일

- `src/lib/buildTelegramBotStartUrl.ts`
- `src/hooks/useTelegramLink.ts`
- `src/components/mypage/MyPageTelegramLink.tsx`
- `src/components/mypage/MyPageTelegramLink.module.css`
- `src/pages/MyPage.tsx`

## 확인

- Mac Chrome에서 텔레그램 연동 클릭 시 팝업 차단 없이 앱 또는 Web 클라이언트로 이동
- 연동 페이지에서 t.me / Telegram Web 재오픈 링크 동작
- 모바일·앱 설치 환경에서 기존 `t.me` 흐름 유지
