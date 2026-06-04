# Change Log — 2026-06-04 · feat · 홈 대시보드 레이아웃·AI 브리핑

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/home-watchlist-ai-summary` |
| 화면 | 홈 `/` |

## 요약

홈을 **AI 요약 → 포트폴리오·이상치 → 관심 종목 → KOSPI·언급·섹터** 순으로 재구성했다. 관심 종목은 타일/리스트 전환, 이상치는 주의·기회 대신 **신호 라벨**로 표기하고 숫자 색은 등락·종목 목록과 같이 **부호(+/-)** 기준으로 통일했다.

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
- 타일: 가로 스크롤, 카드 묶음 **가운데 정렬**

### 오늘 이상치 (`DashboardAlertCards` · `pickDashboardAlerts`)

| Before | After |
|--------|-------|
| `주의` / `기회` | `등락 하락` · `감성 부정` · `언급 급증` · `시장 급등` |
| 신호별 카드 색(빨강·노랑·파랑) | 카드 배경 통일, **숫자만** 초록/빨강/중립 |

규칙: 관심종목 등락 최저·감성 -20 미만·언급률 최고 + buzz TOP3(시장).

### KOSPI · 게이지

- `DashboardKospiChip`: `SentimentArcGauge` (포트폴리오와 동일 5색 아크 + 흰 점)
- `SentimentArcGauge`: 기본 SVG 바늘 숨김, `gaugeArcDotLayout` + `ResizeObserver`로 점 위치 보정

### 데이터

- `fetchDashboardBriefing` · `useDashboardBriefing`
- `DashboardBriefing` / `DashboardBriefingResponse` 타입·목업

## 파일 (주요)

| 경로 | 역할 |
|------|------|
| `src/pages/DashboardPage.tsx` | 섹션 재배치 |
| `src/components/dashboard/DashboardWatchlistSection.tsx` | 타일/리스트 섹션 |
| `src/components/dashboard/DashboardWatchlistTable.tsx` | embedded 리스트 |
| `src/components/dashboard/DashboardAlertCards.tsx` | 이상치 카드 |
| `src/components/dashboard/pickDashboardAlerts.ts` | 이상치 선정 |
| `src/components/dashboard/DashboardKospiChip.tsx` | KOSPI 아크 |
| `src/components/dashboard/DashboardAiBrief.tsx` | AI 요약 카드 |
| `src/components/dashboard/buildDashboardAiBrief.ts` | 브리핑 폴백 문장 |
| `src/components/dashboard/SentimentArcGauge.tsx` | 아크·점 |
| `src/components/dashboard/gaugeArcDotLayout.ts` | 점 좌표 |
| `src/data/clients/dashboardClient.ts` | briefing API |
| `src/hooks/useDashboardBriefing.ts` | 브리핑 훅 |

## 확인

- [ ] 로그인: AI 브리핑·포트폴리오 게이지·관심 타일/리스트·이상치 3칸·하단 2열
- [ ] 비로그인: 브리핑 폴백·포트폴리오 로그인 유도·이상치는 buzz만
- [ ] 리스트 보기: 세로 스크롤 없이 전체 행 표시
- [ ] 이상치: `+` 초록 · `-` 빨강 · 라벨만 회색

## Notes

- 관심종목 로드 시 종목별 `GET /stocks/{code}/summary` N회 호출은 그대로(메트릭용). `aiSummary` lazy 모달·배치 API는 후속.

## 연관

- [2026-06-04-fix-zero-price-change-display.md](./2026-06-04-fix-zero-price-change-display.md) — 동일 브랜치 선행 커밋
