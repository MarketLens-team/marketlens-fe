# Change Log — 2026-05-26 · feat/news-feed-watchlist-sidebar

`/news` 페이지에 오늘 뉴스 순위 사이드바·전체/관심종목 피드 탭·인물 발언형 2열 레이아웃 반영.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| BE API | `GET /api/v1/stocks/today-news` · `GET /api/v1/news/feed/watchlist/cursor` |

## 요약

- **좌측** `StockTodayNewsSidebar` — 오늘 뉴스 TOP 5(더보기 10), 순위·아바타·종목명·상대 막대·건수
- **우측 상단** `NewsFeedModeTabs` — 전체 뉴스 / 관심종목 뉴스 pill 탭
- **피드** `useNewsFeedPage` — `feed/all/cursor` · `feed/watchlist/cursor` 커서 무한 스크롤
- **레이아웃** `personPageLayout`과 동일 2열 그리드(좌 패널 + 피드), 가운데 `read-max` 제거

## Added

| 파일 | 내용 |
|------|------|
| `components/news/StockTodayNewsSidebar.tsx` | 오늘 뉴스 순위 카드 |
| `components/news/NewsFeedModeTabs.tsx` | 전체/관심 탭 |
| `hooks/useNewsFeedPage.ts` | 피드 모드·페이지네이션 |
| `hooks/useTodayNewsStocks.ts` | today-news 조회 |
| `data/clients/stockClient.ts` | `fetchStockTodayNews` |
| `data/clients/newsClient.ts` | `fetchWatchlistNewsFeedCursor` |
| `data/mocks/stockTodayNews.mock.ts` | mock 순위 |

## Changed

| 파일 | 내용 |
|------|------|
| `pages/NewsFeedPage.tsx` | 2열 레이아웃·탭·관심 비로그인 유도 |
| `pages/NewsFeedPage.module.css` | 인물 발언형 그리드 |
| `hooks/useAllNewsFeed.ts` | `useNewsFeedPage('all')` 위임 |

## UX

| 항목 | 내용 |
|------|------|
| 관심 탭 + 비로그인 | API 미호출 · `DashboardLoginPrompt` |
| 관심 0건 | 빈 목록 EmptyState |
| 사이드바 기본 | TOP 5 · 더보기 TOP 10 |

## 확인

- [ ] `/news` — today-news 순위·막대·더보기
- [ ] 전체/관심 탭 전환·무한 스크롤
- [ ] 관심 탭 로그인·빈 관심목록
- [ ] 넓은 화면 피드 좌측 정렬(인물 발언과 유사)
