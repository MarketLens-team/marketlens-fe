# Change Log — 2026-06-04 · feat · 홈 오늘 이상치 카드

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/home-watchlist-ai-summary` |
| 화면 | 홈 `/` — 오늘 이상치 (`DashboardAlertCards`) |

## 요약

하단 **언급 TOP3·워치리스트 언급률**과 겹치던 이상치 슬롯을 다른 지표로 바꾸고, 선정 기준 pill·로고·한 줄 레이아웃으로 왜 뽑혔는지 바로 보이게 정리했다.

## Changed

### 선정 규칙 (`pickDashboardAlerts`)

| 순서 | 기준 | 큰 숫자 | scope |
|------|------|---------|-------|
| 1 | 관심 **등락 최저** (`changePercent < 0`) | 등락률 | 관심 |
| 2 | 관심 **감성 최저** (점수 &lt; -20) | 감성 | 관심 |
| 3 | 관심 **등락 최고** (`changePercent > 0`) | 등락률 | 관심 |
| 4 | 관심 **감성 최고** (점수 &gt; +20) | 감성 | 관심 |
| 5 | 관심 **뉴스 최다** (`newsCount`) | N건 | 관심 |
| 6 | 시장 **섹터 감성 최저** | 섹터 감성 | 시장 → `/sector` |

**제거:** 관심 언급률 최고 · 시장 `buzzTop3` 언급률 TOP (하단 블록과 중복).

### UI (`DashboardAlertCards`)

| 항목 | Before | After |
|------|--------|-------|
| 레이아웃 | 세로 쌓기 → 숫자 아래·빈 공간 | 3열 그리드: 로고 \| 이름+pill \| 숫자 (세로 중앙) |
| 선정 이유 | `뉴스 감성 …` 부가 문구 (오해) | `[관심]` + `[등락 최저]` 등 **기준 pill** |
| 로고 | 없음 | `EntityAvatar` md |
| 타이포 | base / xl | lg / 2xl, 패딩·간격 확대 |
| 시장 카드 | 개별 종목 buzz | 섹터명 + 감성 (AI 호버 없음) |

### 데이터 연동

- `DashboardPage`: `buzzTop3` 대신 `sectorHeatmap`을 `pickDashboardAlerts`에 전달
- 호버 모달 라벨: `관심 · 등락 최저` 등 `criterion` 문자열 사용

## 파일

- `src/components/dashboard/pickDashboardAlerts.ts`
- `src/components/dashboard/DashboardAlertCards.tsx`
- `src/components/dashboard/DashboardAlertCards.module.css`
- `src/components/dashboard/buildDashboardSummaryTarget.ts`
- `src/pages/DashboardPage.tsx`

## 확인

- [ ] 이상치 3칸: 등락 최저·등락 최고·감성 최고 등 **기준 pill**과 숫자 의미 일치
- [ ] 언급률 %가 이상치에 **안 나옴** (하단 TOP3·관심 리스트에만)
- [ ] 카드 한 줄 정렬, 로고·숫자 크기 체감
- [ ] 시장 슬롯 클릭 시 `/sector` 이동
- [ ] 종목 카드 호버 1.5s AI 모달 유지
