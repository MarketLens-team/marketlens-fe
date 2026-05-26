# Change Log — 2026-05-26 · feat/stock-overview-page

`/stock` 전체 종목 페이지를 **overview·rankings API** 기반 Binance형 레이아웃으로 개편. (이전 `prices`+directory 시세 테이블 초안은 본 작업으로 대체.)

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `de5ef2d` · `378be41` · `de1204f` · `7b42253` · `b8cb7a2` · `abe4581` · `80496a9` · `fd9f26b` |
| BE API | `GET /api/v1/stocks/overview` · `GET /api/v1/stocks/rankings` |
| 선행 | [2026-05-26-feat-stock-market-list.md](./2026-05-26-feat-stock-market-list.md) (초안) · [DDR-0002](../ddr/0002-detail-breadcrumb-navigation.md) |

## 요약

- **상단** 3종 랭킹 카드 — 언급량·감성·급등 TOP 3 (openapi에 시세 TOP 없음), Binance Hot형 **한 줄** 행(아이콘·종목명·가운데 지표·오른쪽 보조 지표), 「더보기」→ 테이블 해당 컬럼 정렬
- **감성 델타** `sentimentDelta24h` — 양수=개선·음수=악화·`0`=변화 없음·`null`=비교 불가(`—`, 색상 없음, 정렬 시 맨 아래). **0으로 치환 금지**
- **필터** 섹터 칩(가로 스크롤)만 유지 — KOSPI/KOSDAQ 탭·검색 제거
- **목록** `StockOverviewTable` — 종목·현재가·등락·24h 언급량·언급률·감성·**감성 변화**, 카드/구분선 없음, `rowRing` 행 호버
- **여백** 레이아웃 기본 `--layout-main-pad-inline` (일시적 full-bleed 축소는 되돌림)
- **데이터** `useStockListPageData` — overview+rankings 병렬, 30초 폴링 (`keepPreviousData`)

## API·데이터

| API | FE 매핑 |
|-----|---------|
| `overview` → `items[]` | `StockOverviewRow[]` (`stocks` 아님 **`items`** 필드) |
| `rankings` | `topMentionCount` · `topSentimentScore` · `topChangeRate` (시세 TOP 없음) |
| `sentimentDelta24h` | `toNullableNumber` — `null` 보존 |

| 파일 | 내용 |
|------|------|
| `stockApi.ts` | `StockOverviewResponse` · `StockRankingsResponse` · nullable 델타 |
| `stockClient.ts` | `fetchStockOverview` · `fetchStockRankings` |
| `stockMapper.ts` | `mapStockOverviewResponse` · `mapStockRankingsResponse` |
| `toNullableNumber.ts` | API `null`/`undefined` → `null`, 숫자만 파싱 |
| `sentimentDelta.ts` | `formatSentimentDelta24h()` — 표시·톤·툴팁 |
| `stockOverview.mock.ts` | mock overview·rankings·델타 null 샘플 |
| `useStockListPageData.ts` | 페이지 단일 훅 |

## UI 컴포넌트

| 파일 | 내용 |
|------|------|
| `StockRankingCards.tsx` · `StockRankingCard.tsx` | 3열 그리드, `radius-lg`, grid 행(mention/sentiment/change) |
| `StockOverviewTable.tsx` | 플랫 테이블, 언급률·감성 변화 null→`—`, 정렬 |
| `StockListPage.tsx` | 랭킹 → 섹터 → N종목 → 테이블, `sentimentDelta` 정렬 |

### 랭킹 카드 행별 표시

| 카드 | 가운데 | 오른쪽 |
|------|--------|--------|
| 언급량 TOP | 24h 언급 건수 | 언급률 % (`null`→`—`) |
| 감성 TOP | 감성 점수(색) | 감성 변화 델타 |
| 급등 TOP | 등락 % (색) | 현재가 |

## Changed (커밋별)

| 커밋 | 내용 |
|------|------|
| `de5ef2d` | overview·rankings 연동, Binance형 1차 레이아웃 |
| `378be41` | overview `items` 필드 매핑 수정(테이블 0종목 버그), 시장/검색·섹터 컬럼·카드 래퍼 제거 |
| `de1204f` | 24h 언급량·언급률 컬럼 분리, 액션 컬럼 제거 |
| `7b42253` | `PageHeader`·테이블 `CardSectionHeader` 중복 제거 |
| `b8cb7a2` | 랭킹 카드 표시 일관성·숫자 가독성·`ringRow` |
| `abe4581` | 시세 TOP 카드 제거 (openapi 3종만) |
| `80496a9` | 랭킹 일렬 레이아웃·`sentimentDelta24h` null 처리·`toNullableNumber` |
| `fd9f26b` | 테이블 **감성 변화** 컬럼·페이지 여백 레이아웃 기본값 복원·changelog 갱신 |

## Notes

- `fetchStockMarketList`(directory+prices)는 TickerBar 등에서 계속 사용, `/stock` 목록은 overview 전용.
- 컬럼명 **감성 변화** = 점수 델타(퍼센트 변화율 아님). BE Swagger에 `null` 의미 문서화 권장.
- 스냅샷 `docs/snapshots/2026-05-26/04-stock-list.png` — 개편 전 UI, 재촬영 권장.

## 확인

- [ ] `/stock` 실 API — 랭킹 3카드·테이블 종목 수·섹터 필터
- [ ] overview `items` 비어 있지 않음
- [ ] 감성 변화: 값·`null`→`—`·정렬 시 null 맨 아래
- [ ] 컬럼 정렬·행 클릭 → `/stock/:code`
- [ ] 「더보기」→ 테이블 스크롤·정렬
- [ ] mock(`VITE_USE_MOCK_DATA`) 동일 동작
