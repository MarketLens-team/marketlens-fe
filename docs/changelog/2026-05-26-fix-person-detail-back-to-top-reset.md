# Change Log — 2026-05-26 · fix/person-detail-back-to-top-reset

인물 상세 맨 위로 — anchored 피드를 cursor 최신순으로 리셋, `statementId` 초록 강조 유지.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-detail-profile-sticky.md](./2026-05-26-fix-person-detail-profile-sticky.md) |

## 증상

- `?statementId=` 진입 후 맨 위로를 눌러도 around·양방향 anchored 상태가 유지되어, 최신 발언 목록으로 돌아가기 어려움.
- 맨 위로 후 포커스 발언으로 자동 스크롤이 다시 걸리는 경우가 있음.

## 수정

| 파일 | 내용 |
|------|------|
| `usePersonDetail` | `resetToLatestFeed` — around 취소 후 cursor 첫 페이지 로드, `suppressAnchored`로 latest 모드 전환. |
| `useAnchoredFeed` | `cancelAroundLoad` — 진행 중 around 응답 무시. |
| `usePersonStatementFocus` | `skipAutoScroll` — 맨 위로 후 초록 강조만 유지. |
| `BackToTopButton` / `PageFabRail` | `onBackToTop` 콜백. |
| `PersonDetailPage` | `statementId` 있을 때 FAB 클릭 시 리셋 + 스크롤 맨 위. |

## Notes

- URL `statementId`는 제거하지 않음 — 해당 카드가 첫 페이지에 있으면 초록 강조 유지.
- 일반 진입(쿼리 없음)은 스크롤만 수행.
