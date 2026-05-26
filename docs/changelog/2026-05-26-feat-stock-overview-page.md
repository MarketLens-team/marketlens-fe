# Change Log — 2026-05-26 · feat/stock-overview-page

`/stock` 전체 종목 페이지를 **overview·rankings API** 기반 Binance형 레이아웃으로 개편. (이전 `prices`+directory 시세 테이블 초안은 본 작업으로 대체.)

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `de5ef2d` · `378be41` · `de1204f` · `7b42253` · `b8cb7a2` |
| BE API | `GET /api/v1/stocks/overview` · `GET /api/v1/stocks/rankings` |
| 선행 | [2026-05-26-feat-stock-market-list.md](./2026-05-26-feat-stock-market-list.md) (초안) · [DDR-0002](../ddr/0002-detail-breadcrumb-navigation.md) |

## 요약

- **상단** 4종 랭킹 카드 — 언급량·감성·급등·시세 TOP 3, 「더보기」→ 테이블 해당 컬럼 정렬
- **필터** 섹터 칩(가로 스크롤)만 유지 — KOSPI/KOSDAQ 탭·검색 제거
- **목록** `StockOverviewTable` — 종목·현재가·등락·24h 언급량·언급률·감성, 카드/구분선 없음, `rowRing` 행 호버
- **데이터** `useStockListPageData` — overview+rankings 병렬, 30초 폴링 (`keepPreviousData`)

## API·데이터

| API | FE 매핑 |
|-----|---------|
| `overview` → `items[]` | `StockOverviewRow[]` (`stocks` 아님 **`items`** 필드) |
| `overview.currentNewsCount` | 헤더 제거 전 합계 문구용 → 이후 UI에서 제거 |
| `rankings` | `topMentionCount` · `topSentimentScore` · `topChangeRate` · `topCurrentPrice` |

| 파일 | 내용 |
|------|------|
| `stockApi.ts` | `StockOverviewResponse` · `StockRankingsResponse` |
| `stockClient.ts` | `fetchStockOverview` · `fetchStockRankings` |
| `stockMapper.ts` | `mapStockOverviewResponse` · `mapStockRankingsResponse` |
| `stockOverview.mock.ts` | mock overview·rankings |
| `useStockListPageData.ts` | 페이지 단일 훅 |

## UI 컴포넌트

| 파일 | 내용 |
|------|------|
| `StockRankingCards.tsx` · `StockRankingCard.tsx` | 4열 그리드, 카드 `radius-lg`, 행 primary/secondary 값 통일 |
| `StockOverviewTable.tsx` | 플랫 테이블, 숫자 우측 정렬·mono lg |
| `StockListPage.tsx` | 랭킹 → 섹터 → N종목 → 테이블 |

## Changed (커밋별)

| 커밋 | 내용 |
|------|------|
| `de5ef2d` | overview·rankings 연동, Binance형 1차 레이아웃 |
| `378be41` | overview `items` 필드 매핑 수정(테이블 0종목 버그), 시장/검색·섹터 컬럼·카드 래퍼 제거 |
| `de1204f` | 24h 언급량·언급률 컬럼 분리, 액션 컬럼 제거 |
| `7b42253` | `PageHeader`·테이블 `CardSectionHeader` 중복 제거 |
| `b8cb7a2` | 랭킹 카드 표시 일관성·숫자 가독성·여백·`ringRow` |

## Notes

- `fetchStockMarketList`(directory+prices)는 TickerBar 등에서 계속 사용, `/stock` 목록은 overview 전용.
- 랭킹 카드: 주 지표(흰색) + 보조 지표(등락/언급률 색상) — 카드마다 지표 종류만 다름.
- 스냅샷 `docs/snapshots/2026-05-26/04-stock-list.png` — 개편 전 UI, 재촬영 권장.

## 확인

- [ ] `/stock` 실 API — 랭킹 4카드·테이블 종목 수·섹터 필터
- [ ] overview `items` 비어 있지 않음
- [ ] 컬럼 정렬(언급량·언급률·감성 등)·행 클릭 → `/stock/:code`
- [ ] 「더보기」→ 테이블 스크롤·정렬
- [ ] mock(`VITE_USE_MOCK_DATA`) 동일 동작
