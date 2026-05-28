# Change Log — 2026-05-29 · style/onboarding-redesign

## 메타
| 브랜치   | style/home-onboarding |
| 작업일   | 2026-05-29            |
| 관련 PR  | -                     |
| 커밋     | cc298e0, db82be1, 487aa66 |

## 요약

온보딩 화면(`/onboarding`)을 앱 디자인 언어에 맞게 리디자인.
배경 그리드 패턴, 상단 primary 글로우, 카드 top accent, 스텝 인디케이터 추가.
감성 게이지 도트 위치·크기 버그도 함께 수정.

---

## Changed

### 온보딩 페이지 디자인 (`OnboardingPage.module.css`, `OnboardingPage.tsx`)
- **배경**: `::before` 32px 그리드 패턴(불투명도 60%) + `::after` 상단 primary 라디얼 글로우
  — `DevErrorPagesPage` 등 앱 내 다른 인증 계열 화면과 동일한 분위기
- **카드 top accent**: `border-top: 2px` primary 혼합색 라인 — AuthPanel 탭 인디케이터와 같은 파란 포인트
- **이중 box-shadow**: 외곽 primary 미묘한 링 + 깊이감 그림자
- **스텝 인디케이터** (`StepIndicator` 컴포넌트 추가)
  - `① 관심 종목 ────── ② 알림 설정` 형태
  - 활성 단계: primary dot + semibold 흰 레이블 / 비활성: muted dot + muted 텍스트
  - `aria-current="step"` 접근성 지원

### 감성 게이지 도트 위치 수정 (`SentimentArcGauge.module.css`)
- arc 밴드 중앙에 정렬 (기존: 외곽 엣지 위치)
- `.arcDot` glow `box-shadow` 추가
- `.needleArm` 높이 재보정: `clamp(4.25rem, 38.5cqw, 6.5rem)`
- `.gaugeWrap` `max-width: 280px` 추가 — 넓은 뷰포트에서 `react-gauge-chart`가 SVG 높이를 과도하게 자동 계산하는 문제 방지

## Notes
- `react-gauge-chart`는 `style.height`를 무시하고 SVG 높이를 `svgWidth / 2 × 0.9`로 자동 계산함
  → `gaugeWrap`에 `max-width` 제한으로 해결
- 스텝 인디케이터는 클릭 불가(단방향 진행), `role` 없이 `aria-label` + `aria-current`만 사용
