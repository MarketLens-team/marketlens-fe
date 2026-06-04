# Change Log — 2026-06-04 · feat · 홈 대시보드 레이아웃·AI 브리핑

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/home-watchlist-ai-summary` |
| 화면 | 홈 `/` |

## 요약

홈을 **AI 요약 → 포트폴리오·이상치 → 관심 종목 → KOSPI·언급·섹터** 순으로 재구성했다. 관심 종목은 타일/리스트 전환, 이상치는 **신호 라벨**·호버 **AI 요약 모달**, 숫자 색은 등락·종목 목록과 같이 **부호(+/-)** 기준으로 통일했다.

## Changed

### 레이아웃 (`DashboardPage`)

| 영역 | 내용 |
|------|------|
| 상단 | `DashboardAiBrief` — `GET /api/v1/dashboard/briefing` (`todaySummary`), 없으면 `buildDashboardAiBrief` 폴백 |
| 2열 | 좌 `PortfolioSentimentGauge` · 우 `DashboardAlertCards` (오늘 이상치) |
| 중간 | `DashboardWatchlistSection` — 「관심 종목 한눈에」, 타일/리스트 단일 pill 토글 |
| 하단 | 좌 `DashboardKospiChip`(아크 게이지) + `BuzzSurgeTop3` · 우 `SectorHeatmapGrid` |

### 관심 종목 (`DashboardWatchlistSection`)

- 펼치기 바 제거, 카드/리스트 pill 버튼(필터 pill 톤)으로 보기 전환
- 리스트: `StockOverviewTable` 밀도, 링 행, **내부 세로 스크롤 없음**(행 수만큼 높이)
- 타일: 가로 스크롤, 카드 묶음 **가운데 정렬**, 호버 시 AI 요약 모달(로고·등락만 표시)

### 오늘 이상치 (`DashboardAlertCards` · `pickDashboardAlerts`)

| Before | After |
|--------|-------|
| `주의` / `기회` | `등락 하락` · `감성 부정` · `언급 급증` · `시장 급등` |
| 신호별 카드 색(빨강·노랑·파랑) | 카드 배경 통일, **숫자만** 초록/빨강/중립 |

규칙: 관심종목 등락 최저·감성 -20 미만·언급률 최고 + buzz TOP3(시장).

#### 호버 AI 요약 모달 (`DashboardAnomalySummaryModal`)

적용: **오늘 이상치** · **관심종목 타일** · **언급량 급증 TOP 3** (`buildDashboardSummaryTarget`)

- 호버 **1.5s** 후 중앙 모달, 검색 모달과 동일 `--color-bg-modal` 팔레트
- 헤더: 종목 로고(`resolveStockImageUrl` · `Stock{code}.svg` 폴백), 신호·수치(이상치 신호 / 관심 종목+등락 / 언급 급증+%), ×
- **종목 상세** primary 버튼 — `disableHover`(scale·색 변화 없음)
- 본문: `GET /api/v1/stocks/{code}/summary` → `aiSummary` (캐시·stale 응답 무시)
- 상호작용: 딤 클릭·Esc 닫기, 배경 클릭·선택 차단, **고정 호버 영역** 안이면 유지
- 타이밍: 표시 후 **3s** 유예 → 영역 이탈 **0.7s** 후 닫기

### KOSPI · 게이지

- `DashboardKospiChip`: `SentimentArcGauge` (포트폴리오와 동일 5색 아크 + 흰 점)
- `SentimentArcGauge`: 기본 SVG 바늘 숨김, `gaugeArcDotLayout` + `ResizeObserver`로 점 위치 보정

### 데이터

- `fetchDashboardBriefing` · `useDashboardBriefing`
- `fetchWatchlistSummariesBatch` — `GET /api/v1/stocks/summaries/batch` (JWT, aiSummary 제외)
- 홈·마이페이지 관심종목: 종목별 `summary` N회 호출 제거
- `DashboardBriefing` / `DashboardBriefingResponse` · `StockSummaryBatchItemResponse` 타입·목업

### UI 공통

- `Modal`: `onOverlayMouseEnter` / `onOverlayMouseLeave` (호버 모달용)

## 파일 (주요)

| 경로 | 역할 |
|------|------|
| `src/pages/DashboardPage.tsx` | 섹션 재배치 |
| `src/components/dashboard/DashboardWatchlistSection.tsx` | 타일/리스트 섹션 |
| `src/components/dashboard/DashboardWatchlistTable.tsx` | embedded 리스트 |
| `src/components/dashboard/DashboardAlertCards.tsx` | 이상치 카드·호버 바인딩 |
| `src/components/dashboard/BuzzSurgeTop3.tsx` | 언급 급증 TOP3·호버 바인딩 |
| `src/components/dashboard/buildDashboardSummaryTarget.ts` | 모달 헤더 타겟 빌더 |
| `src/components/dashboard/DashboardAnomalySummaryModal.tsx` | AI 요약 모달 |
| `src/components/dashboard/useDashboardAnomalySummary.ts` | 호버·캐시·타이밍 |
| `src/components/dashboard/pickDashboardAlerts.ts` | 이상치 선정·imageUrl |
| `src/components/dashboard/DashboardKospiChip.tsx` | KOSPI 아크 |
| `src/components/dashboard/DashboardAiBrief.tsx` | AI 요약 카드 |
| `src/components/dashboard/buildDashboardAiBrief.ts` | 브리핑 폴백 문장 |
| `src/components/dashboard/SentimentArcGauge.tsx` | 아크·점 |
| `src/components/dashboard/gaugeArcDotLayout.ts` | 점 좌표 |
| `src/components/ui/Modal.tsx` | 오버레이 호버 콜백 |
| `src/data/clients/dashboardClient.ts` | briefing·watchlist 로드 |
| `src/data/clients/stockClient.ts` | batch·summary API |
| `src/data/clients/myPageClient.ts` | batch 연동 |
| `src/lib/normalizeImageUrl.ts` | `resolveStockImageUrl` |
| `src/hooks/useDashboardBriefing.ts` | 브리핑 훅 |

## 확인

- [ ] 로그인: AI 브리핑·포트폴리오 게이지·관심 타일/리스트·이상치 3칸·하단 2열
- [ ] 비로그인: 브리핑 폴백·포트폴리오 로그인 유도·이상치는 buzz만
- [ ] 리스트 보기: 세로 스크롤 없이 전체 행 표시
- [ ] 이상치: `+` 초록 · `-` 빨강 · 라벨만 회색
- [ ] 이상치·관심 타일·언급 TOP3 호버 1.5s → 모달, 딤·영역 이탈 닫기
- [ ] 관심종목 로드 시 `summaries/batch` 1회(네트워크 탭)

## Notes

- 시장 급등 카드: buzz API에 `imageUrl` 없으면 `Stock{code}.svg` 폴백.
- 언급량 급등 TOP10 등 다른 화면은 기존 인라인 `aiSummary` 유지.

## 연관

- [2026-06-04-fix-zero-price-change-display.md](./2026-06-04-fix-zero-price-change-display.md) — 동일 브랜치 선행 커밋
