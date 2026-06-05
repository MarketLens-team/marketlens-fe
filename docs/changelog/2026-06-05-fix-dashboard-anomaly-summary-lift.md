# Change Log — 2026-06-05 · fix · 홈 이상치 AI 요약 훅 lift

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/dashboard-anomaly-summary-lift` |
| 커밋 | (커밋 후 갱신) |

## 요약

홈 대시보드 3곳(이상치 카드·언급 TOP3·관심종목)이 각각 `useDashboardAnomalySummary`·모달을 갖고 캐시가 분리되던 문제를 `DashboardPage` 단일 인스턴스로 합쳤다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useDashboardAnomalySummary` | 컴포넌트 3인스턴스 | `DashboardPage` 1인스턴스 |
| `DashboardAnomalySummaryModal` | DOM 3개 | 1개 |
| 동일 종목 호버 AI 요약 | 위젯마다 `fetchStockSummary` 재시도 | 공유 `cacheRef`로 1회 |

## 파일

- `src/pages/DashboardPage.tsx`
- `src/components/dashboard/DashboardAlertCards.tsx`
- `src/components/dashboard/BuzzSurgeTop3.tsx`
- `src/components/dashboard/DashboardWatchlistSection.tsx`
- `src/components/dashboard/useDashboardAnomalySummary.ts`

## 확인

- [ ] 홈에서 동일 종목을 이상치·TOP3 등에서 호버 — `summary` 1회
- [ ] 1.5s 호버 모달·호버 이탈 닫힘 동작 유지
- [ ] `npm run lint:js` · `npm run build` 통과
