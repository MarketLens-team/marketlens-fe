# Change Log — 2026-05-27 · fix/news-feed-newer-scroll-ux

전체·종목 뉴스 anchored 피드 — newer 로딩 표시 및 위로 스크롤 시 위치 튐 현상 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 커밋 | `d634ee5` · `229fb93` · `e0d84c5` |
| 관련 | [2026-05-26-fix-person-feed-scroll-ux.md](./2026-05-26-fix-person-feed-scroll-ux.md) · [2026-05-27-fix-stock-detail-newsid-persist.md](./2026-05-27-fix-stock-detail-newsid-persist.md) · [2026-05-27-fix-news-feed-older-scroll-ux.md](./2026-05-27-fix-news-feed-older-scroll-ux.md) |

## 증상

- `?newsId=` anchored 모드에서 위로 스크롤해 newer 로드 시 **목록이 밀리거나 튀는** 모션이 어색함.
- **빠르게** 위로 스크롤하면 API 응답보다 스크롤이 앞서가, 보정이 겹치거나 생략되어 **차트·헤더 쪽으로 화면이 넘어가** 보임.
- newer 로딩 중 상·하단 피드백이 없거나, 스피너가 목록 `<ul>` 안에 들어가 **prepend·스크롤 복원과 겹침**.
- sticky 인물 타임라인·상단 패널이 메인 스크롤 보정과 함께 흔들림.

## 수정

| 파일 | 내용 |
|------|------|
| `NewsFeedPage.tsx` · `NewsFeedPage.module.css` | newer **오버레이** 스피너·`feedWrap`·older `anchoredLoadingUi` 연동. |
| `StockDetailContent.tsx` · `.module.css` | 오버레이·`StockDetailMiddleGrid` memo·`overflow-anchor`·sticky 사이드·하단 `newsScrollFoot`를 `ul` 밖으로. |
| `useNewsFeedPage.ts` | `anchoredLoadingUi` 노출·`loadNewerWithError`. |
| `useAnchoredFeed.ts` | newer 로딩 시작 시 스냅샷·`lockScrollRoot`·prepend 후 `applyPrependScrollRestore`·로딩 종료 시 잠금 해제. |
| `useInfiniteScroll.ts` | 위 스크롤 디바운스·상단 IO와 휠 정합·쿨다운·**IO 콜백 ref 고정**(로딩 토글 시 재구독 방지). |
| `preserveScrollOnPrepend.ts` | 목록 높이 기준 `applyPrependScrollRestore`·`lockScrollRoot` / `setLockedTop`. |
| `anchoredFeed.ts` | `ANCHORED_INFINITE_SCROLL_COOLDOWN_MS` 400. |
| `AllNewsListItem.tsx` · `.module.css` | `data-scroll-anchor-item` · `overflow-anchor: none`. |
| `personPageLayout.module.css` | 발언 피드 `overflow-anchor: none`. |

### 후속 — 스크롤 잠금 (`e0d84c5`)

- idle·drift 기반 `restorePrependScrollWhenIdle` **제거**.
- newer 스피너가 보이는 동안 `main[data-scroll-root]` **휠·터치·scrollTop 고정**.
- API 응답·prepend 직후 목록 높이만 보정하고 잠금 기준 `scrollTop` 갱신 → 로딩 UI 종료 시 해제.

## Notes

- 인물·종목·전체 뉴스 공통: `loadingNewer \|\| anchoredLoadingUi === 'newer'` 시 상단 스피너 (`이전 뉴스 불러오는 중`).
- 오버레이는 `position: absolute` — 스크롤 높이를 바꾸지 않음.
- 하단 older 연속 로드는 [2026-05-27-fix-news-feed-older-scroll-ux.md](./2026-05-27-fix-news-feed-older-scroll-ux.md) 참고.

## 확인

- [ ] `/news?newsId=…` — 위로 스크롤 newer 로드 시 읽던 기사 위치 유지·상단 스피너·빠른 위 스크롤 시 차트/헤더로 튀지 않음
- [ ] 종목 상세 `?newsId=…` — 동일
- [ ] 하단 older — 종목 상세와 같이 한 페이지씩 로드 ([older changelog](./2026-05-27-fix-news-feed-older-scroll-ux.md))
