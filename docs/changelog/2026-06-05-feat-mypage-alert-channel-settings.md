# Change Log — 2026-06-05 · feat · 마이페이지 알림 수신 채널 설정

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | `/mypage?tab=account` |
| OpenAPI | `GET/PUT /api/members/me/settings` — `emailNotificationEnabled`, `telegramNotificationEnabled` |

## 요약

백엔드 알림 채널 설정 API에 맞춰 계정 설정 탭에 이메일·텔레그램 수신 채널 토글을 추가했다. **텔레그램 연동**은 별도 섹션(비밀번호 변경 아래)으로 두고, 알림 설정은 채널·종류 ON/OFF만 담당한다. 데스크톱 연동은 텔레그램 앱 설치를 전제로 `tg://`만 실행하고 t.me 탭 자동 오픈은 제거했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `AlertSettings` 타입 | 알림 종류 4필드 | + `emailNotificationEnabled`, `telegramNotificationEnabled` |
| 알림 설정 UI | 알림 종류 4토글만 | **수신 채널**(이메일·텔레그램) + 구분선 + **알림 종류** |
| 계정 탭 섹션 순서 | 계정 정보 → 텔레그램 → 비밀번호 → 알림 | 계정 정보 → **비밀번호** → **텔레그램 연동** → **알림 설정** |
| 텔레그램 연동 UI | 알림 설정 행에 버튼 혼재(중간 시안) | `MyPageTelegramLink` 단독 섹션, 알림 설정은 토글만 |
| 데스크톱 연동 오픈 | `tg://` + assist 탭 → `t.me` 자동 오픈 | `tg://`만 — 브라우저 「Telegram 열기」 확인 후 앱 실행 |
| t.me / Web 폴백 | 연동 클릭 시 자동 탭 | 연동 시도 후 UI 링크로만 제공 |
| 저장 API body | 4필드 | 6필드 (`PUT /api/members/me/settings`) |
| 회원가입 기본값 | 채널 필드 없음 | 이메일·텔레그램 ON (`DEFAULT_ALERT_SETTINGS`) |

## API

```json
{
  "buzzSurgeEnabled": true,
  "sentimentChangeEnabled": true,
  "personMentionEnabled": true,
  "dailySummaryEnabled": true,
  "emailNotificationEnabled": true,
  "telegramNotificationEnabled": true
}
```

## 파일

- `src/data/types/member.ts`
- `src/components/mypage/MyPageAlertSettings.tsx` · `.module.css`
- `src/components/mypage/MyPageTelegramLink.tsx` — 연동 안내·폴백 링크
- `src/lib/buildTelegramBotStartUrl.ts` · `src/hooks/useTelegramLink.ts`
- `src/data/mocks/myPage.mock.ts`
- `src/components/auth/SignupAlertsStep.tsx` — `DEFAULT_ALERT_SETTINGS`
- `src/pages/MyPage.tsx` — 섹션 순서·스낵바 안내

## 확인

- 계정 설정 탭: 수신 채널·알림 종류 토글 ON/OFF → 즉시 저장
- 수신 채널과 알림 종류 사이 `--color-border-strong` 구분선
- 비밀번호 변경 아래 텔레그램 연동 → 알림 설정 순서
- 데스크톱 연동 클릭: t.me 탭 없이 Telegram 앱 열기 확인만, Start 후 연동
- 앱 미열림 시 t.me · Telegram Web 링크 표시
