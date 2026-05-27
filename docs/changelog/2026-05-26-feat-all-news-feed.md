# Change Log — 2026-05-26 · feat/all-news-feed

`/news` 전체 뉴스 피드 페이지. 백엔드 `GET /api/v1/news/feed/all/cursor` 연동, 기사별 `relatedStocks` 태그, 읽기 폭 제한·UI 정리.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `7ae000a` · `2afe363` · `83fc962` · `03f4444` · (관련 종목 칩 스타일) |
| BE API | 목록 `.../all/cursor` · anchored `.../feed/around/{newsId}` · `.../feed/newer` · `.../feed/older` (`/all/around` 아님) |

## 요약

- **라우트** `/news` — 상단·사이드 네비 「전체 뉴스」(기존 `/buzz` 언급량 급등 페이지는 유지)
- **데이터** `fetchAllNewsFeedCursor` · `useAllNewsFeed` — 커서 무한 스크롤 (`limit` 20)
- **UI** `AllNewsListItem` — 메타·제목·요약·썸네일·관련 종목 태그 → 종목 상세
- **레이아웃** `--layout-page-read-max` (50rem) 가운데 정렬, 목록 카드 통합
- **제거** 페이지 제목·설명·감성 필터(전체/긍정/부정)·기사 행 **감성 점수** 표시

## Added

| 파일 | 내용 |
|------|------|
| `pages/NewsFeedPage.tsx` | 전체 뉴스 페이지 |
| `components/news/AllNewsListItem.tsx` | 피드 행 |
| `hooks/useAllNewsFeed.ts` | 로드·더보기 |
| `data/clients/newsClient.ts` | `fetchAllNewsFeedCursor` (mock: `mockStockDetails` 병합) |
| `data/types/stockApi.ts` | `NewsRelatedStockResponse` · `relatedStocks` |
| `data/mappers/stockMapper.ts` | `mapNewsRelatedStocks` |
| `styles/tokens.css` | `--layout-page-read-max` |

## Changed

| 파일 | 내용 |
|------|------|
| `router/index.tsx` | `/news` 라우트 |
| `topNavMenus.ts` · `Sidebar.tsx` | 「전체 뉴스」 → `/news` |
| `lib/buildStockRoute.ts` | `newsId` · `scrollToNews` 쿼리 |
| `StockDetailPage.tsx` · `StockDetailContent.tsx` | `scrollToNews=0` 시 강조만·스크롤 생략 |

## 후속 UX (`83fc962`~)

| 항목 | 내용 |
|------|------|
| 헤더 | 「전체 뉴스」 제목·설명·감성 필터 제거 |
| 관련 종목 클릭 | `/stock/:code?newsId=…&scrollToNews=0` — 종목 상세 **제목 초록 강조**만, **스크롤 없음** |
| 검색 모달 등 | `scrollToNews` 기본값 유지 → 기존처럼 해당 뉴스로 스크롤 |
| `/news` 기사 행 | 원문 새 탭만, 피드 내 포커스·스크롤 없음 |
| 관련 종목 칩 | `relatedStocksRow` 최소 높이, 기본 `border`+`bg-elevated` 항상 표시, 호버 시 `--interactive-ring-*` (`ringChip` composes는 transparent가 이겨 제거) |

## 후속 — anchored 피드 (`?newsId=`)

| 파일 | 내용 |
|------|------|
| `newsClient.ts` | `fetchAllNewsFeedAround` / `Newer` / `Older`, watchlist 동형 |
| `useNewsFeedPage.ts` | `useAnchoredFeed` — `?newsId=` 시 around, 상·하단 newer/older |
| `NewsFeedPage.tsx` | 상·하단 센티넬, 초록 강조 유지(클릭 시 쿼리 해제 없음) |
| `useNewsFeedFocus.ts` | session 복원·latest 모드 cursor 연쇄만 유지 |

## Notes

- 초광폭 모니터: 대시보드·테이블은 `--layout-page-wide-cap`(120rem), 뉴스 피드만 읽기 폭 토큰으로 좁힘.
- BE 커서: `newerCursor` = 배치 첫 항목, `olderCursor` = 배치 마지막 항목 ([anchored 피드 fix](./2026-05-26-fix-anchored-feed-pagination.md)).

## 확인

- [ ] `/news` 실 API·mock — 목록·더보기·썸네일
- [ ] 관련 종목 태그 — 평소 테두리·배경 보임, 호버 링, 클릭 → 종목 상세 강조만
- [ ] 검색 → 종목 상세 — `newsId` 스크롤·강조
- [ ] 기사 행 클릭 → 원문(새 탭)
- [ ] 넓은 화면에서 본문 폭 ~50rem 유지
