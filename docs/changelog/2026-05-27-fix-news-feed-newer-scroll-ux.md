# Change Log — 2026-05-27 · fix/news-feed-newer-scroll-ux

전체·종목 뉴스 anchored 피드 — newer 로딩 표시 및 위로 스크롤 시 위치 튐 현상 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-feed-scroll-ux.md](./2026-05-26-fix-person-feed-scroll-ux.md) · [2026-05-27-fix-stock-detail-newsid-persist.md](./2026-05-27-fix-stock-detail-newsid-persist.md) |

## 증상

- `?newsId=` anchored 모드에서 위로 스크롤해 newer 로드 시 **목록이 밀리거나 튀는** 모션이 어색함.
- **빠르게** 위로 스크롤하면 API 응답보다 스크롤이 앞서가, 보정이 겹치거나 생략되어 **차트·헤더 쪽으로 화면이 넘어가** 보임.
- newer 로딩 중 상·하단 피드백이 없거나, 스피너가 목록 `<ul>` 안에 들어가 **prepend·스크롤 복원과 겹침**.
- sticky 인물 타임라인·상단 패널이 메인 스크롤 보정과 함께 흔들림.

## 수정

| 파일 | 내용 |
|------|------|
| `NewsFeedPage.tsx` · `NewsFeedPage.module.css` | newer **오버레이** 스피너·older `anchoredLoadingUi` 연동. |
| `StockDetailContent.tsx` · `.module.css` | 오버레이·`StockDetailMiddleGrid` memo·`overflow-anchor`·sticky 사이드. |
| `useNewsFeedPage.ts` | `anchoredLoadingUi` 노출. |
| `useAnchoredFeed.ts` | prepend 직전 스냅샷·`flushSync`·`restorePrependScrollWhenIdle`. |
| `useInfiniteScroll.ts` | 위 스크롤 디바운스·상단 IO와 휠 정합·쿨다운 완화. |
| `preserveScrollOnPrepend.ts` | 목록 높이 기준 복원·idle 후 보정·drift 시 **현재 scrollTop + Δheight**. |
| `anchoredFeed.ts` | `ANCHORED_INFINITE_SCROLL_COOLDOWN_MS` 400. |
| `AllNewsListItem.tsx` · `.module.css` | `data-scroll-anchor-item` · `overflow-anchor: none`. |
| `personPageLayout.module.css` | 발언 피드 `overflow-anchor: none`. |

## Notes

- 인물 상세와 동일: `loadingNewer || anchoredLoadingUi === 'newer'` 시 상단 스피너 (`이전 뉴스 불러오는 중`).
- 오버레이는 `position: absolute` — 스크롤 높이를 바꾸지 않음.
- API 대기 중 많이 스크롤한 경우 예전 `scrollTop`으로 끌지 않고, **지금 위치 + prepend 높이**만 반영.

## 확인

- [ ] `/news?newsId=…` — 위로 스크롤 newer 로드 시 읽던 기사 위치 유지·상단 스피너
- [ ] 종목 상세 `?newsId=…` — 동일
- [ ] 하단 older 로드 시 기존처럼 `뉴스 더 불러오는 중` 표시
