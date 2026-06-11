# Change Log — 2026-06-11 · feat · 홈 이상치 AI 요약 우하단 도크

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 커밋 | `7f1a571` |
| 화면 | 홈 `/` — 오늘 이상치 · 관심 종목 · 언급 TOP3 호버 AI 요약 |

## 요약

홈 대시보드 종목 호버 AI 요약을 **중앙 Modal(딤·스크롤 잠금)** 에서 **page-max 우측 하단 도크(FAB + 패널)** 로 전환했다. 호버 0.4초 후 패널·FAB가 자동으로 열리고, 섹션별 하이라이트·바깥 클릭·확인으로 닫는다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| UI | `DashboardAnomalySummaryModal` — 중앙 Modal, `lockBackgroundScroll` | `DashboardAnomalySummaryDock` — fixed 우하단, 딤 없음 |
| 트리거 | 호버 1.5s → Modal 자동 오픈 | 호버 **0.4s** → FAB + 패널 자동 오픈 + fetch |
| 하이라이트 | 없음(또는 code만) | `source + code` (`alert` / `watchlist` / `buzz`) — 동일 종목 중복 선택 방지 |
| 닫기 | Modal 이탈·Esc | **확인** · × · Esc · FAB · 패널 이탈 · **화면 바깥 클릭** |
| FAB | 항상 표시 또는 Modal 전용 | 도크 활성 시에만 표시, 닫으면 FAB·패널·하이라이트 전부 제거 |

## UX 흐름

1. 이상치 / 관심 타일 / 언급 TOP3 행에 마우스 **0.4s** → 해당 **섹션 행만** primary ring 하이라이트
2. 이어서 우하단 **채팅 FAB + AI 요약 패널** 자동 표시 (`GET /api/v1/stocks/{code}/summary`)
3. 마우스를 행에서 떼도 패널·FAB 유지 (행 하이라이트만 해제)
4. **확인** · 화면 클릭 · Esc 등으로 `dismissDock` → 전부 닫힘

## 파일

- `src/components/dashboard/DashboardAnomalySummaryDock.tsx` · `.module.css` — 신규
- `src/components/dashboard/useDashboardAnomalySummary.ts` — 도크 상태·타이밍·캐시
- `src/components/dashboard/DashboardAlertCards.tsx` · `.module.css`
- `src/components/dashboard/DashboardWatchlistSection.tsx` · `.module.css`
- `src/components/dashboard/BuzzSurgeTop3.tsx` · `.module.css`
- `src/pages/DashboardPage.tsx` — Modal → Dock

## 확인

- [ ] 호버 0.4s 후 우하단 FAB + 패널 자동 오픈
- [ ] 삼성전자가 이상치·관심에 동시에 있어도 **호버한 섹션만** 하이라이트
- [ ] 패널이 viewport 우하단에서 잘리지 않음 (page-max `right` 정렬)
- [ ] 화면 바깥 클릭 · 확인 · Esc로 FAB·패널 닫힘
- [ ] 배경 스크롤 잠금 없음

## 비고

- `DashboardAnomalySummaryModal.tsx`는 미사용 상태로 repo에 잔존할 수 있음 — 후속 정리 PR 가능
