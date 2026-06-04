# Change Log — 2026-05-26 · fix/news-back-to-top-reset

종목 상세·전체 뉴스 맨 위로 — anchored 피드를 cursor 최신순으로 리셋, `newsId` 초록 강조 유지.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-detail-back-to-top-reset.md](./2026-05-26-fix-person-detail-back-to-top-reset.md) |

## 증상

- 종목 상세 `?newsId=` 진입 후 맨 위로 클릭 시 포커스 해제(`newsId` 삭제)로 초록 강조가 사라짐 — FAB `pointerdown`이 바깥 클릭으로 처리됨.
- 전체·관심종목 뉴스도 anchored 상태가 유지되어 최신순 목록으로 돌아가기 어려움.

## 수정

| 파일 | 내용 |
|------|------|
| `StockDetailContent` | 맨 위로 제외·`resetToLatestNewsFeed`·`suppressAnchored`·`skipFocusScroll`. |
| `useNewsFeedPage` | `resetToLatestFeed`·`suppressAnchored` — around 해제 후 cursor 첫 페이지. |
| `useNewsFeedFocus` | `skipAutoScroll` — 맨 위로 후 포커스 기사 자동 스크롤 억제. |
| `NewsFeedPage` | FAB `onBackToTop` 연결. |

## Notes

- URL `newsId`는 유지 — 첫 페이지에 해당 기사가 있으면 초록 강조 유지.
- 후속: [2026-05-27-fix-stock-detail-newsid-persist.md](./2026-05-27-fix-stock-detail-newsid-persist.md) — 바깥 클릭 시에도 `newsId` 유지(`/news`와 동일).
