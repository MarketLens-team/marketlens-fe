# Change Log - 2026-06-01 · style: 온보딩 관심종목 overview·섹터 필터

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

온보딩 관심종목 선택을 `GET /api/v1/stocks/overview` 기반으로 전환했다. `imageUrl`·섹터 정보를 활용해 로고 칩과 `FilterDropdown` 섹터 필터를 추가하고, 페이지 배경 격자무늬를 제거했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/components/auth/SignupWatchlistStep.tsx` | `fetchStockOverview` + 섹터 그룹핑, `FilterDropdown`, `EntityAvatar`, 선택 시 `imageUrl` 저장, fetch 성공 시 에러 초기화 |
| `src/components/auth/SignupWatchlistStep.module.css` | 필터 바·칩 아바타 레이아웃 |
| `src/pages/OnboardingPage.module.css` | 배경 격자(`::before`) 제거, 상단 glow 유지 |

## 확인

- [ ] `/onboarding` 종목 칩·선택 칩에 로고 표시
- [ ] 섹터 `FilterDropdown`으로 카드 필터링
- [ ] 검색 + 섹터 필터 조합 동작
- [ ] 배경 격자무늬 미표시
