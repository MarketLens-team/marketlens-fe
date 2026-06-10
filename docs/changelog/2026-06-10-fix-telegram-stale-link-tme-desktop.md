# Change Log — 2026-06-10 · fix · 텔레그램 연동 stale 링크·데스크톱 t.me

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | `/mypage?tab=account` · 온보딩 텔레그램 연동 단계 |

## 요약

재연동·연타 시 이전 Web A `tgaddr` 탭과 폴백 `t.me` 링크에 만료 토큰이 남아 「인증 코드 만료」가 반복되던 문제를 줄였다. 데스크톱 기본 오픈을 `t.me?start=`로 바꿔 API 토큰과 주소창을 바로 대조할 수 있게 했다.

## 증상

- Network `telegram-link-token` 응답 토큰과 Telegram `/start` 토큰이 다르게 보임
- 배포·로컬에서 예전 `start=` 링크로 봇에 진입해 만료 메시지 반복
- Web A 탭이 여러 개 열려 이전 `tgaddr` URL을 다시 사용

## 원인

- 데스크톱이 Web A `tgaddr` 탭을 먼저 열어 연동마다 탭이 누적됨
- `linking` state 비동기 가드로 빠른 연타 시 토큰·탭이 섞임
- 폴백 `<a href>`가 토큰 갱신 전 DOM에 잠깐 남을 수 있음

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 데스크톱 연동 오픈 | `web.telegram.org/a/#?tgaddr=...` | `t.me/{bot}?start={token}` |
| Web A QR | 기본 오픈 | 폴백 링크(`봇 열기`)로만 |
| 연동 중복 클릭 | `linking` state만 검사 | `linkingRef` 동기 가드 |
| assist 탭 | 이전 탭 유지 | 새 연동 시 이전 assist 탭 `close` |
| 폴백 링크 DOM | 고정 key 없음 | `key={linkUrls.tme}`로 토큰별 remount |

## 파일

- `src/lib/buildTelegramBotStartUrl.ts`
- `src/hooks/useTelegramLink.ts`
- `src/components/mypage/MyPageTelegramLink.tsx`
- `src/components/auth/SignupTelegramLinkStep.tsx`

## 확인

- 연동 클릭 → 열린 탭 주소 `start=` = DevTools `telegram-link-token` 응답
- 연동 재시도 시 이전 assist 탭이 닫히고 새 `t.me`만 열림
- Start **한 번** 후 `POST /api/telegram/webhook` 로그·연동 완료 메시지
- 토큰 발급 API와 웹훅이 **동일 Redis**(배포 API 기준)인 환경에서 테스트
