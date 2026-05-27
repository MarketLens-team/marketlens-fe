# Change Log — 2026-05-27 · fix/news-feed-newer-scroll-ux

전체·종목 뉴스 anchored 피드 — newer 로딩 표시 및 위로 스크롤 시 위치 튐 현상 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-feed-scroll-ux.md](./2026-05-26-fix-person-feed-scroll-ux.md) · [2026-05-27-fix-stock-detail-newsid-persist.md](./2026-05-27-fix-stock-detail-newsid-persist.md) |

## 증상

- `?newsId=` anchored 모드에서 위로 스크롤해 newer 로드 시 **목록이 밀리거나 튀는** 모션이 어색함.
- newer 로딩 중 상·하단 피드백이 없거나, 스피너가 목록 `<ul>` 안에 들어가 **prepend·스크롤 복원과 겹침**.
- 전체 뉴스(`AllNewsListItem`)에 `data-scroll-anchor-item`이 없어 prepend 앵커 복원이 부정확함.

## 수정

| 파일 | 내용 |
|------|------|
| `NewsFeedPage.tsx` · `NewsFeedPage.module.css` | newer **오버레이** 스피너·older `anchoredLoadingUi` 연동. |
| `StockDetailContent.tsx` · `.module.css` | 동일 패턴(`newsFeedWrap` / `newsNewerOverlay`). |
| `useNewsFeedPage.ts` | `anchoredLoadingUi` 노출. |
| `useAnchoredFeed.ts` | newer prepend `flushSync` + 즉시·연속 `restorePrependScrollSnapshot`. |
| `AllNewsListItem.tsx` | `data-scroll-anchor-item` 추가. |

## Notes

- 인물 상세와 동일: `loadingNewer || anchoredLoadingUi === 'newer'` 시 상단 스피너 (`이전 뉴스 불러오는 중`).
- 오버레이는 `position: absolute` — 스크롤 높이를 바꾸지 않아 prepend 보정과 충돌하지 않음.

## 확인

- [ ] `/news?newsId=…` — 위로 스크롤 newer 로드 시 읽던 기사 위치 유지·상단 스피너
- [ ] 종목 상세 `?newsId=…` — 동일
- [ ] 하단 older 로드 시 기존처럼 `뉴스 더 불러오는 중` 표시
