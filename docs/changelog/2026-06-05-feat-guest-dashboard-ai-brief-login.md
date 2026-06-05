# Change Log — 2026-06-05 · feat · 비로그인 AI 요약 로그인 버튼

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | 홈 `/` — 오늘 시장 요약 (`DashboardAiBrief`) |

## 요약

비로그인 홈 AI 요약 카드에 **로그인** 버튼을 추가해, 맞춤 브리핑 안내 문구 직후 바로 로그인 모달로 이어지게 했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `DashboardAiBrief` | 요약 텍스트만 | `showLoginAction` 시 하단 primary **로그인** 버튼 |
| `DashboardPage` | — | 비로그인일 때 `showLoginAction` 전달 |

## 파일

- `src/components/dashboard/DashboardAiBrief.tsx` · `.module.css`
- `src/pages/DashboardPage.tsx`

## 확인

- [ ] 비로그인 홈: AI 요약 아래 로그인 버튼 표시
- [ ] 클릭 시 로그인 모달 오픈
- [ ] 로그인 상태: 버튼 미표시
