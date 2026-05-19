# Change Log — 2026-05-19 · feat/core-pages

브랜치 `feat/core-pages`에서 진행한 **레이아웃·홈 대시보드(목업) 재구성** 작업 기록입니다.  
월별 파일(`2026-05.md`)보다 이 문서가 브랜치 단위 진입점입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/core-pages` |
| 작업일 | 2026-05-19 |
| 베이스 | `develop` (auth-login-signup #11 머지 이후) |
| 관련 PR | _(미작성)_ |

## 요약

상단 네비·페이지 셸을 정리하고, 홈(`/`)을 **포트폴리오 감성 게이지 + 언급량 급증 TOP3(좌)** / **관심 종목 워치리스트(우)** / **KOSPI 감성 + 섹터 히트맵(하)** 구조의 목업 대시보드로 구성했습니다. 감성 지표는 `react-gauge-chart` 아크 게이지로 통일하고, 섹터 히트맵은 `d3-hierarchy` Treemap SVG로 렌더합니다. 워치리스트·언급량 급증 항목 클릭 시 `/stock/:code`로 이동합니다.

## Added

### 레이아웃

- `Topbar` — 상단 네비 메뉴 재구성, **사이드바 기본 숨김**
- `DetailSplitShell` — 좌측 아코디언 사이드바 **기본 숨김** (`defaultSidebarOpen={false}`)
- 각 상세 페이지(`StockDetailPage`, `SectorPage` 등) — 셸 props 정리

### 홈 대시보드 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `PortfolioSentimentGauge` | 포트폴리오 감성 아크 게이지 |
| `SentimentGaugePanel` | KOSPI 시장 감성 아크 게이지 |
| `SentimentArcGauge` | 공통 게이지 (`customNeedleComponent`, `textComponent`) |
| `sentimentGaugeShared.ts` | 스케일·라벨·색 구간 공유 |
| `BuzzSurgeTop3` | 언급량 급증 TOP3 목록 |
| `DashboardWatchlistTable` | 관심 종목 워치리스트 테이블 |
| `SectorHeatmapGrid` | 섹터 감성 Treemap (SVG + `ResizeObserver`) |
| `sectorTreemap.ts` | `layoutSectorTreemap`, `sentimentFill` (-50~+50) |

### 데이터·타입

- `src/data/types/dashboard.ts` — `DashboardOverview`, `BuzzSurgeItem`(종목 `code` 포함) 등
- `src/data/mocks/dashboard.mock.ts` — 홈 대시보드 목업 (감성 스케일 **-100 ~ 100**)

### 공통 UI

- `CardSectionHeader` — `variant="embedded"`, `showChevron` (카드 상단 좌측 헤더)

### 의존성

- `react-gauge-chart` — 포트폴리오·KOSPI 아크 게이지
- `d3-hierarchy` — 섹터 Treemap 레이아웃
- `src/types/react-gauge-chart.d.ts` — 타입 선언

## Changed

- **`DashboardPage`** — 2열(좌: 게이지+TOP3 / 우: 워치리스트) + 하단(KOSPI+섹터) 그리드; 본문 스크롤 동작 수정
- **워치리스트** — `ResizeObserver`로 좌측 열 높이에 맞추고 **테이블 영역만 스크롤**
- **카드 헤더** — 대시보드 카드 전반 `embedded` 스타일 통일
- **게이지** — 직접 SVG 아크 제거 → `react-gauge-chart`; 바늘 대신 **흰 점** `customNeedleComponent` + CSS 회전
- **KOSPI 패널** — 포트폴리오와 동일 아크 게이지; 감성 **분포 바(긍/중/부 %)** 제거
- **섹터 히트맵** — recharts Treemap 시도 후 **d3 Treemap SVG**로 전환; 카드 높이·패딩(4px)·가독성 조정
- **문구** — 「시장 전체 컨텍스트」`h2` 제거; `PageHeader` 설명에서 `시장 컨텍스트` 삭제
- **네비게이션** — 워치리스트 **행 전체** 클릭·키보드 → `/stock/:code`; 언급량 TOP3 **항목 링크** 동일

## Removed

- KOSPI 카드 하단 **감성 분포 바** UI
- 포트폴리오·KOSPI용 **커스텀 SVG 아크** 구현 (게이지 라이브러리로 대체)

## 의도적으로 하지 않음 (후속)

- 대시보드 실 API 연동 (`VITE_USE_MOCK_DATA` 목 유지)
- 섹터 Treemap 셀 클릭 → 섹터 상세 라우팅
- 워치리스트 알림(🔔) 열 단독 동작 (현재는 행 클릭과 동일하게 상세 이동)

## 커밋 (시간순)

1. `23f88ef` — 상단 네비 메뉴 재구성 및 사이드바 기본 숨김
2. `39471a0` — DetailSplitShell 좌측 사이드바 기본 숨김
3. `449324e` — 목업 기반 홈 대시보드 구성 및 본문 스크롤 수정
4. `0e63603` — 좌측 감성 게이지·언급량 TOP3, 관심종목 우측 배치
5. `0f1fbf2` — 워치리스트 높이를 좌측 열에 맞추고 내부만 스크롤
6. `7ffb0f6` — 대시보드 카드 헤더 embedded 레이아웃 통일
7. `7727cc5` — 포트폴리오 감성 게이지를 react-gauge-chart로 전환
8. `199a7d9` — KOSPI 아크 게이지 통일 및 섹터 Treemap 히트맵
9. `5482a05` — KOSPI·섹터 카드 높이 맞춤 및 Treemap 가독성 개선
10. `543692b` — 섹터 감성 히트맵을 d3-hierarchy Treemap SVG로 전환
11. `cd3063d` — 시장 전체 컨텍스트 섹션 제목 및 헤더 문구 정리
12. `26c6bee` — 워치리스트·언급량 급증 행 클릭 시 종목 상세로 이동

## 확인

```bash
npm run lint
npm run build
```

- [ ] `/` 홈 — 좌(게이지+TOP3) / 우(워치리스트) / 하(KOSPI+섹터) 레이아웃
- [ ] 워치리스트 행 클릭 → `/stock/:code`
- [ ] 언급량 TOP3 항목 클릭 → `/stock/:code`
- [ ] 워치리스트만 내부 스크롤, 좌측 열 높이와 정렬
- [ ] 포트폴리오·KOSPI 게이지 -100~100 스케일·바늘(흰 점) 표시
- [ ] 섹터 Treemap 색상(감성 점수)·리사이즈 대응
- [ ] 상단 네비·DetailSplitShell 사이드바 기본 닫힘
