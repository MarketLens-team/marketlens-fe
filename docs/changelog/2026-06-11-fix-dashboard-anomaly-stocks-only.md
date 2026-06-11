# Change Log — 2026-06-11 · fix · 홈 오늘 이상치 종목 전용

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 홈 `/` — 오늘 이상치 (`DashboardAlertCards`) |

## 요약

로그인 홈 **오늘 이상치**에서 관심 종목이 3칸을 못 채울 때 **섹터 감성 최저**(예: 금융)가 들어가던 슬롯을 제거하고, 남는 칸은 **시장 이상치 종목**으로만 채우도록 통일했다. 비로그인과 동일하게 이상치 카드는 종목만 표시한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 로그인 이상치 6번 슬롯 | `sectorHeatmap` → 섹터 감성 최저 1칸 | 제거 |
| 로그인 빈 슬롯 | 섹터 카드로 보충 | `marketOutlierRows` 종목 백필 |
| `pickDashboardAlerts` | `sectorHeatmap` 인자·`sector_sentiment_low` | 종목 신호만 |
| `dashboardClient` | 로그인 + 관심 있으면 `marketOutlierRows` 빈 배열 | 로그인 여부와 무관하게 rankings·buzz 병합 |
| 카드 UI | 종목/섹터 분기(`sectorMark`) | `EntityAvatar` 종목만 |

## 선정 규칙 (로그인)

1. 관심 종목 풀에서 기존 우선순위(등락·감성·뉴스 등)로 최대 3개
2. 부족분은 `marketOutlierRows`에서 중복 제외 후 `[시장]` scope 종목으로 보충

섹터 정보는 하단 **섹터 감성 히트맵**에서만 확인.

## 파일

- `src/components/dashboard/pickDashboardAlerts.ts` — 섹터 슬롯 제거, `pickDashboardAlertsWithMarketBackfill` 추가
- `src/components/dashboard/DashboardAlertCards.tsx`
- `src/components/dashboard/buildDashboardAiBrief.ts`
- `src/data/clients/dashboardClient.ts` — `fetchMarketOutlierRows` 공통화
- `src/pages/DashboardPage.tsx`

## 확인

- [ ] 로그인 홈: 오늘 이상치에 **섹터명 카드 없음**
- [ ] 관심 1종목만 있어도 나머지 칸이 **시장 종목**으로 채워짐
- [ ] 비로그인: 기존과 동일하게 종목 3칸
- [ ] 종목 카드 호버 AI 요약 유지
