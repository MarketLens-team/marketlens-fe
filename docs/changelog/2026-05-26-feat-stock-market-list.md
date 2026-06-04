# Change Log — 2026-05-26 · feat/stock-market-list (초안 · 대체됨)

> **상태: 대체됨** — `/stock` 목록 UI는 [2026-05-26-feat-stock-overview-page.md](./2026-05-26-feat-stock-overview-page.md) (overview·rankings API)로 교체됨. 아래는 `aa6e09e` 시점 기록 보존.

`/stock` 전체 종목을 섹터 칩 목록에서 **시세 테이블**(CMC·토스류)로 전환. `GET /api/v1/stocks/prices` + 종목 directory 병합.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| FE 커밋 | `aa6e09e` |
| 선행 | `69e7353` 브레드크럼·`/stock` 라우트 |

## 요약 (역사)

- `fetchStockMarketList` — prices API + directory → `StockMarketRow[]`
- `StockMarketTable` — # · 종목 · 시장 · 섹터 · 현재가 · 등락%
- `useStockMarketList` — 30초 폴링

## 후속

- `de5ef2d`~`b8cb7a2` — overview·rankings API, 랭킹 카드, 언급·감성 컬럼 → [feat-stock-overview-page](./2026-05-26-feat-stock-overview-page.md)
