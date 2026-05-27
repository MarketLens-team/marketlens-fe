# Change Log — 2026-05-27 · fix/stock-detail-newsid-persist

종목 상세 `?newsId=` — 바깥·강조 기사 클릭해도 URL·초록 강조 유지 (전체 뉴스 피드와 동일).

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-news-back-to-top-reset.md](./2026-05-26-fix-news-back-to-top-reset.md) · [2026-05-26-feat-all-news-feed.md](./2026-05-26-feat-all-news-feed.md) |

## 증상

- 종목 상세 `?newsId=`(예: `7043`) 진입 시 초록 제목 강조가 **강조된 기사·바깥 영역 클릭**으로 사라짐.
- `document` `pointerdown`(capture)에서 `newsId`·`scrollToNews` 쿼리를 `replace`로 제거하는 UX가 `/news` 피드(클릭해도 쿼리 유지)와 불일치.

## 수정

| 파일 | 내용 |
|------|------|
| `StockDetailContent.tsx` | `onClearFocusNews` prop·바깥 클릭 `pointerdown` 리스너 제거. |
| `StockDetailPage.tsx` | `clearFocusNews`·`setSearchParams` 삭제 — `newsId`는 라우트 이탈 시에만 변경. |
| `StockNewsListItem.tsx` | 스크롤 타깃 id를 `stockNewsItemElementId()`로 통일. |

## Notes

- 맨 위로(FAB)는 [fix/news-back-to-top-reset](./2026-05-26-fix-news-back-to-top-reset.md)대로 `newsId` 유지·anchored → cursor 리셋만 수행.
- `newsId` 해제는 다른 페이지 이동·URL 직접 변경·종목 코드 변경 시에만 발생.

## 확인

- [ ] `/stock/:code?newsId=…` — 강조 기사·차트·필터·다른 뉴스 행 클릭 후에도 URL·초록 제목 유지
- [ ] 맨 위로 — 최신순 리셋 + `newsId` 유지
- [ ] 검색·전체 뉴스 → 종목 상세 왕복 — `scrollToNews=0` 강조만 동작
