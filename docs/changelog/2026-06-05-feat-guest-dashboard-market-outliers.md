# Change Log — 2026-06-05 · feat · 비로그인 홈 시장 이상치 종목

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | 홈 `/` (비로그인) |
| API | `GET /api/v1/dashboard/overview`, `GET /api/v1/stocks/rankings` |

## 요약

비로그인 홈에서 로그인 유도 카드 대신 **시장 이상치 종목**을 overview·rankings·buzzTop3로 자동 선정해 보여준다. AI 요약·이상치 카드·하단 KOSPI·섹터 블록만 노출하고 포트폴리오·관심 종목 섹션은 숨긴다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 이상치 데이터 | 관심 종목 없음 → 섹터 1칸만 | `rankings` + `buzzTop3` → `marketOutlierRows` |
| 이상치 scope | (없음) | `[시장]` pill, 종목 최대 3개 |
| AI 브리핑 | 로그인 유도 문장 | 선정 종목명 기반 시장 이상치 요약 |
| 레이아웃 | 포트폴리오·관심 로그인 유도 | 이상치 카드 full width + 하단 시장 블록 |
| `pickDashboardAlerts` | 관심 scope 고정 | `stockScope` 파라미터 (`watchlist` \| `market`) |

## 선정 규칙 (비로그인)

`marketOutlierRows` 풀에서 기존과 동일한 우선순위(등락 최저/최고·감성·뉴스·언급 급증) 적용. **섹터 감성 최저** 슬롯은 비로그인에서 제외(종목만).

## 파일

- `src/data/mappers/dashboardMarketOutliers.ts` — rankings·buzz 병합
- `src/data/clients/dashboardClient.ts` — watchlist 없을 때 rankings fetch
- `src/data/types/dashboard.ts` — `marketOutlierRows`
- `src/components/dashboard/pickDashboardAlerts.ts` — `stockScope`
- `src/components/dashboard/DashboardAlertCards.tsx`
- `src/components/dashboard/buildDashboardAiBrief.ts`
- `src/pages/DashboardPage.tsx` · `.module.css`

## 확인

- [ ] 비로그인 홈: 포트폴리오·관심 로그인 유도 없음
- [ ] 오늘 이상치 3칸: 종목 로고·`[시장]` pill·등락/감성/언급 수치
- [ ] AI 요약에 선정 종목명 포함
- [ ] 로그인: 기존 레이아웃·관심+시장 이상치 유지
