# Change Log — 2026-06-04 · style · 섹터 감성 히트맵 레이아웃

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/home-watchlist-ai-summary` |
| 화면 | 홈 `/` — 하단 `SectorHeatmapGrid` |

## 요약

섹터 히트맵을 **섹터 단일 treemap**으로 유지하면서, **이중 카드 테두리 제거**, **감성 색·텍스트 가독성**, **왼쪽 KOSPI·언급 TOP3 열과 하단 라인 정렬**을 맞췄다.

## Changed

### Treemap (`sectorTreemap.ts` · `SectorHeatmapGrid`)

| 항목 | 내용 |
|------|------|
| 레이아웃 | d3 `treemapSquarify.ratio(1)`, 면적=언급량(선형), `sectorTreemapLayoutSize` 16:9 |
| 감성 색 | 섹터 전용 부호 기준(±0.5), mix 채도 상향 — 종목 상세 ±20 중립과 분리 |
| 텍스트 | `fill`을 `rect`만 적용(SVG 상속 방지), 채색 셀은 `--color-fab-on-surface` |
| 구조 | 종목 2단 treemap·디렉터리 fetch **미적용**(섹터만) |

### 카드·레이아웃

| Before | After |
|--------|-------|
| `Card` + `chartWrap` 이중 border/배경 | `Card` 1겹, `chartWrap`은 비율·flex만 |
| 히트맵이 왼쪽 열보다 길게 늘어남 | `marketAside` `ResizeObserver` → `heatmapWrap` 동일 `height` |
| 헤더·범례 | `CardSectionHeader` embedded + 우측 감성 범례, 왼쪽 카드와 `margin-bottom` 통일 |

### 페이지 (`DashboardPage`)

- `marketSection`: `align-items: start`
- `heatmapWrap`: 왼쪽 열 높이 동기화, 내부 카드 `height: 100%`, 차트 `flex: 1`

### 데이터

- `SectorHeatmapCell.sectorCode` — API `sectorCode` 매핑(추후 매칭용)

## 파일 (주요)

| 경로 | 역할 |
|------|------|
| `src/components/dashboard/sectorTreemap.ts` | squarify·감성 톤·레이아웃 크기 |
| `src/components/dashboard/SectorHeatmapGrid.tsx` | SVG 셀·범례 |
| `src/components/dashboard/SectorHeatmapGrid.module.css` | rect/텍스트 색, 단일 카드 |
| `src/pages/DashboardPage.tsx` | `marketAside` 높이 동기화 |
| `src/pages/DashboardPage.module.css` | 2열·heatmapWrap |
| `src/data/mappers/dashboardMapper.ts` | `sectorCode` |

## 확인

- [ ] 하단: KOSPI+TOP3 왼쪽 / 섹터 히트맵 오른쪽, **카드 하단 라인 일치**
- [ ] 히트맵 카드 **테두리 1겹**, 초록/빨강/회색 구분·흰 글자 가독성
- [ ] `+` 섹터 초록 · `-` 섹터 빨강 · 0 근처 회색

## 연관

- [2026-06-04-feat-home-dashboard-layout.md](./2026-06-04-feat-home-dashboard-layout.md) — 홈 하단 2열 배치
- 커밋 `1b80716` — squarify·색상·텍스트 1차 반영
