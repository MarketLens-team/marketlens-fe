# Change Log — 2026-05-26 · feat/news-feed-session-navigation

뉴스 피드 ↔ 종목 상세 왕복 UX — session 복원·포커스·FAB·관련 종목 스크롤.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| 관련 커밋 | `c0824ad`~`becb5f5` 및 본 커밋 |

## 요약

- **sessionStorage** — 종목 이동 전 피드·스크롤·`newsId`·탭 모드 저장, 뒤로가기 1회 복원 (`replaceState`로 consume 레이스 방지)
- **관련 종목** — 클릭 시 종목 상세 해당 뉴스로 스크롤·강조 (`scrollToNews` 기본)
- **피드 안정화** — `newsId`만 바뀔 때 전체 refetch 하지 않음
- **맨 위로** — `PageFabRail`로 뉴스·인물 그리드 레일 통일, 종목은 fixed 오버레이(본문 너비 유지)
- **감성 점수** — ±20 중립 노란색 (`stockSentimentTone`) — 상세·뉴스 목록·검색 모달
- **UI** — 뉴스 피드 항목 구분선 제거
- **차트** — 30일 감성 추이 극단 구간 배경이 플롯 끝까지 채워지도록 너비 동기화
- **포커스 로드** — `newsId` 미발견 시 `hasNext` 있는 동안 계속 loadMore (횟수 상한 없음)

## Added

| 파일 | 내용 |
|------|------|
| `lib/newsFeedSession.ts` | 스냅샷 저장·소비·Strict Mode 메모리 캐시 |
| `hooks/useNavigateToStockFromNewsFeed.ts` | session + `history.replaceState` + navigate |
| `hooks/useNewsFeedFocus.ts` | `?newsId=` 스크롤·강조·포인터 해제 |
| `components/common/PageFabRail.tsx` | 공통 FAB 레일 |

## Changed

| 파일 | 내용 |
|------|------|
| `hooks/useNewsFeedPage.ts` | session 복원·`focusNewsId` refetch 분리 |
| `components/news/AllNewsListItem.tsx` | 관련 종목 → `navigateToStockFromNews` |
| `components/news/AllNewsListItem.module.css` | `border-bottom` 구분선 제거 |
| `components/stock/StockDetailContent.tsx` | `scrollStockNewsItemIntoView`·뉴스 포커스 loadMore |
| `components/stock/stockScore.ts` | `stockSentimentTone()` |
| `components/common/TopNavSearchModal.tsx` | 검색 뉴스 감성 ±20 색 |
| `pages/PersonTrackerPage.tsx` · `PersonDetailPage.tsx` | `PageFabRail` 4열 그리드 |
| `pages/NewsFeedPage.tsx` | `PageFabRail` |
| `components/stock/StockSentimentTrendChart.tsx` | 밴드 레이어 너비·`subscribeSizeChange` |
| `components/common/BackToTopButton.module.css` | 종목 fixed FAB page-max 정렬 |

## UX

| 항목 | 내용 |
|------|------|
| 뒤로가기 | 피드 목록·스크롤·강조 뉴스 복원 |
| 다른 관련 종목 | 피드 리로드 없이 session만 갱신 후 종목 이동 |
| 종목 상세 | `?newsId=` 해당 기사 중앙 스크롤 |
| 감성 색 | \|점수\| ≤ 20 → warning, 그 외 pos/neg |

## 확인

- [ ] 뉴스 → 종목 A → 뒤로 → 스크롤·강조 유지
- [ ] 복원 상태에서 다른 관련 종목 → 피드 깜빡임 없음 → 종목 B 해당 뉴스 스크롤
- [ ] `/news` 피드 구분선 없음
- [ ] 검색·종목 뉴스 ±20 노란색
- [ ] 감성 추이 차트 초록/빨강 배경이 차트 끝까지
