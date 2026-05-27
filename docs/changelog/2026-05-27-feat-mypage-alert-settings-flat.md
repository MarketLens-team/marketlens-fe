# Change Log — 2026-05-27 · feat · 마이페이지 알림 설정 플랫 UI

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | feat/design-refresh |
| 화면 | `/mypage?tab=account` — `MyPageAlertSettings` |

## 요약

계정 설정 탭의 알림 설정을 Card 박스 UI에서 CMC 스타일 플랫 리스트로 변경했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 컨테이너 | `Card` + `CardSectionHeader` | `<section>` + 페이지 제목 `알림 설정` |
| 항목 행 | 테두리·배경 박스 | 구분선 없음, `gap`으로 간격 |
| 소제목 `알림` | `h3` 섹션 타이틀 | **제거** (페이지 제목만 유지) |
| 알림 예시 | 노란 `exampleBox` 카드 | `알림 예시` 섹션 + 본문 텍스트 |
| 타이포 | `base` / `sm` | 제목 `xl`, 설명 `base` |
| 토글 OFF | `--color-interactive-active` | muted grey track |

## 파일

- `src/components/mypage/MyPageAlertSettings.tsx`
- `src/components/mypage/MyPageAlertSettings.module.css`

## 확인

- 계정 설정 탭에서 토글 ON/OFF·저장 동작
- 항목 간 구분선 없음, 제목·설명 가독성
