# Change Log — 2026-05-26 · feat/stock-market-list (초안)

> **상태: 초안** — PR·스냅샷·확인 체크리스트는 머지 전 보완 예정.

`/stock` 전체 종목을 섹터 칩 목록에서 **시세 테이블**(CMC·토스류)로 전환. `GET /api/v1/stocks/prices` + 종목 directory 병합.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| FE 커밋 | `aa6e09e` |
| 선행 | `69e7353` 브레드크럼·`/stock` 라우트, `8bf2fe7` 브레드크럼 색, `5a58e90` 인물 정렬·포커스 스크롤 |

## 요약

- `fetchStockMarketList` — prices API + directory → `StockMarketRow[]`
- `StockMarketTable` — # · 종목 · 시장 · 섹터 · 현재가 · 등락%, 헤더 정렬·행 클릭 → 상세
- `useStockMarketList` — TickerBar와 동일 30초 폴링
- 검색: 종목명·코드·섹터·시장

## Changed

| 파일 | 내용 |
|------|------|
| `stockClient.ts` | `fetchStockMarketList` |
| `stockMapper.ts` | `mapDirectoryToStockMarketRows` |
| `stockPrices.mock.ts` | directory 전 종목 mock 시세 |
| `StockListPage.tsx` | 테이블 UI |
| `StockMarketTable.tsx` | 공통 테이블 컴포넌트 |
| `useStockMarketList.ts` | 데이터·폴링 훅 |
| (삭제) `useStockDirectory.ts` | 목록 훅 → 시세 훅으로 대체 |

## Notes (초안)

- 스냅샷 `docs/snapshots/2026-05-26/04-stock-list.png`는 이전 섹터 UI — 테이블 반영 후 재촬영 권장.
- API에만 있고 directory에 없는 종목은 섹터 `—`로 표시.
- 추후: 거래량·감성·스파크라인 등 컬럼은 API 확정 후.

## 확인 (TODO)

- [ ] `/stock` 실 API·mock 각각 시세·정렬
- [ ] 행 클릭 → `/stock/:code` · 브레드크럼 `전체 종목` 복귀
- [ ] 폴링 중 이전 데이터 유지(`keepPreviousData`)
