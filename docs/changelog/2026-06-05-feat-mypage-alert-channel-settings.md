# Change Log — 2026-06-05 · feat · 마이페이지 알림 수신 채널 설정

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | `/mypage?tab=account` — `MyPageAlertSettings` |
| OpenAPI | `GET/PUT /api/members/me/settings` — `emailNotificationEnabled`, `telegramNotificationEnabled` |

## 요약

백엔드 알림 채널 설정 API에 맞춰 계정 설정 탭 알림 UI에 이메일·텔레그램 수신 채널 토글을 추가했다. 알림 종류(4종)와 수신 채널(2종)을 구분선으로 나눴다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `AlertSettings` 타입 | 알림 종류 4필드 | + `emailNotificationEnabled`, `telegramNotificationEnabled` |
| 알림 설정 UI | 알림 종류 4토글만 | **수신 채널**(이메일·텔레그램) + 구분선 + **알림 종류** |
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
- `src/data/mocks/myPage.mock.ts`
- `src/components/auth/SignupAlertsStep.tsx` — `DEFAULT_ALERT_SETTINGS`

## 확인

- 계정 설정 탭: 수신 채널·알림 종류 토글 ON/OFF → 즉시 저장
- 수신 채널과 알림 종류 사이 `--color-border-strong` 구분선
- 텔레그램 토글 설명에 연동 필요 안내 (연동 UI는 상단 `MyPageTelegramLink`)
