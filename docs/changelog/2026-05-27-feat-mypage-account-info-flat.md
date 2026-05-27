# Change Log — 2026-05-27 · feat · 마이페이지 계정 정보 플랫 UI

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | feat/design-refresh |
| 화면 | `/mypage?tab=account` — `MyPageAccountInfo` |

## 요약

계정 정보를 알림 설정과 같은 플랫 섹션 스타일로 맞췄다. Card·2열 grid 제거.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 컨테이너 | `Card` + embedded 헤더 | `<section>` + `h2` `계정 정보` |
| 필드 레이아웃 | 라벨·값 가로 2열 (`5rem` + 값) | 라벨(위, muted) / 값(아래, `xl` semibold) 세로 |
| 플랜 | mono semibold | `valuePlan` (mono, uppercase) |
| 계정 탭 간격 | `tabPanel` 기본 | `tabPanelSections` — 섹션 간 `space-8` |

## 파일

- `src/components/mypage/MyPageAccountInfo.tsx`
- `src/components/mypage/MyPageAccountInfo.module.css`
- `src/pages/MyPage.tsx` — `tabPanelSections`
- `src/pages/MyPage.module.css`

## 확인

- 계정 설정 탭에서 계정 정보·알림 설정 시각 톤 일치
- 이메일 등 긴 값 줄바꿈
