# Change Log — 2026-05-26 · feat/all-news-feed

`/news` 전체 뉴스 피드 페이지. 백엔드 `GET /api/v1/news/feed/all/cursor` 연동, 기사별 `relatedStocks` 태그, 읽기 폭 제한·UI 정리.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `7ae000a` · `2afe363` · `83fc962` |
| BE API | `GET /api/v1/news/feed/all` · `.../all/cursor` — `NewsFeedItemResponse.relatedStocks[]` |

## 요약

- **라우트** `/news` — 상단·사이드 네비 「전체 뉴스」(기존 `/buzz` 언급량 급등 페이지는 유지)
- **데이터** `fetchAllNewsFeedCursor` · `useAllNewsFeed` — 커서 무한 스크롤 (`limit` 20)
- **UI** `AllNewsListItem` — 메타·제목·요약·썸네일·관련 종목 `ringChip` → 종목 상세
- **레이아웃** `--layout-page-read-max` (50rem) 가운데 정렬, 목록 카드 통합
- **제거** 페이지 제목·설명·감성 필터(전체/긍정/부정)

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

## Notes

- 초광폭 모니터: 대시보드·테이블은 `--layout-page-wide-cap`(120rem), 뉴스 피드만 읽기 폭 토큰으로 좁힘.
- 관련 종목 태그는 `interactiveListRow.module.css` **`ringChip`** (`--interactive-ring-hover` / `focus`).

## 확인

- [ ] `/news` 실 API·mock — 목록·더보기·썸네일
- [ ] 관련 종목 태그 호버·클릭 → `/stock/:code`
- [ ] 기사 행 클릭 → 원문(새 탭)
- [ ] 넓은 화면에서 본문 폭 ~50rem 유지
