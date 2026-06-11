# Change Log — 2026-06-11 · style · 종목 상세 레이아웃 dev 비교

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | `/dev/stock-detail-layout` |

## 요약

종목 상세 헤더·주변 배치를 프로덕션 반영 전에 비교할 dev 페이지를 추가했다. A~K 시안(캔들·히어로·플랫·토스·CMC·DeFi 등)과 함께, **L안(메트릭 바 + 감성 분류 분포 + 라인 차트)** 을 최신 시도안으로 둔다. 프로덕션 `StockDetailContent`는 변경하지 않았다.

## L안 (현재 초점)

| 영역 | 내용 |
|------|------|
| 상단 | 한 줄 메트릭 바 — 종목·티커 뱃지, 현재가, 감성 점수(+우세 뱃지), 언급량, 30일 평균, 관심종목 |
| 중단 | **감성 분류 분포** (「· 오늘」 문구 없음, 카드 없음) |
| 하단 | `StockSentimentTrendChart` (30일 라인 차트, 모든 신규 안 공통) |

제거·미반영: 오늘 핫 이슈 블록, 이슈 스트림(실시간), 캔들 차트(L안 본문).

## 기타 시안 (동일 페이지)

| ID | 이름 | 비고 |
|----|------|------|
| I | 토스형 | 가격·버블·탭 |
| J | CMC형 | 스탯 그리드·테이블 |
| K | DeFi형 | 인덱스·터미널 패널 |
| F~H | 차트 퍼스트·스플릿·에디토리얼 | 라인 차트 고정 변형 |
| E | 전체 포함 | 레거시 요소 일괄 |
| A~D | 초기 시안 | 캔들·히어로·플랫 등 |

## UX

- 상단 **안 탭** sticky — 스크롤 중에도 A~L 바로가기 유지
- 페이지 스크롤: `height: 100%` + `overflow-y: auto` (RootLayout 내 dev 경로)

## 파일

- `src/pages/DevStockDetailLayoutPage.tsx`
- `src/pages/DevStockDetailLayoutPage.module.css`
- `src/data/mocks/devStockDetailLayout.mock.ts`
- `src/router/index.tsx`
- `src/pages/DevActionButtonPage.tsx`

## 확인

- `npm run dev` → `/dev/stock-detail-layout`
- L안: 메트릭 바 → 감성 분류 분포 → 차트 순서
- 실제 종목 상세: `/stock/005930` (기존 UI, 본 PR 비대상)

## 후속 (미결)

- L안 확정 시 `StockDetailContent` 헤더·사이드 분포 영역으로 이식 검토
- 모바일 메트릭 바 wrap·가로 스크롤 정리
