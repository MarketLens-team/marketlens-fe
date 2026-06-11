# Change Log — 2026-06-11 · fix · AI 요약 호버 링 즉시 해제

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 홈 `/` — 오늘 이상치 · 관심 종목 타일 · 언급 TOP3 |
| 선행 | `7f1a571` AI 요약 우하단 도크 |

## 요약

종목 행에서 마우스를 떼도 primary ring 하이라이트가 남거나, 도크 패널로 커서를 옮긴 뒤에도 링이 유지되던 문제를 고쳤다. **호버 중에만** 링을 보여 주고, AI 요약 패널은 별도로 유지한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `scheduleClose` | 400ms 지연 후 `highlight` 해제 | **즉시** `highlight` null |
| 도크 `mouseenter` | `cancelClose` — 패널·하이라이트 타이머 모두 취소 | `cancelDockLeave` — **패널 닫기 타이머만** 취소 |
| UX | 행 이탈 후에도 링이 남아 “선택된 것처럼” 보임 | 호버 = 링 ON, 이탈 = 링 OFF, 패널은 유지 |

## 적용 범위 (공통 hook)

- `DashboardAlertCards` — `alert` / `itemHighlight`
- `DashboardWatchlistSection` — `watchlist` / `tileHighlight`
- `BuzzSurgeTop3` — `buzz` / `itemHighlight`

CSS·스타일은 변경 없음. `useDashboardAnomalySummary.scheduleClose` 동작만 수정.

## 파일

- `src/components/dashboard/useDashboardAnomalySummary.ts`
- `src/pages/DashboardPage.tsx` — `cancelDockLeave` 연동

## 확인

- [ ] 호버 중: 해당 섹션 행만 primary ring
- [ ] 마우스 뗌: 링 즉시 사라짐, 우하단 패널은 유지
- [ ] 도크 패널로 마우스 이동: 링은 꺼진 채, 패널 닫히지 않음
- [ ] 확인·바깥 클릭: 패널·FAB 닫힘
