# DDR-0003: 반응형 타이포·레이아웃 토큰 — 고정 rem → clamp() 전환

## 상태
완료 (post-merge 예정)

## 날짜
2026-05-28

## Related PR
- `fix/responsive-layout` 브랜치

## 맥락

- 기존 `--font-size-*` 8단계는 모두 고정 rem 값(10px~22px)으로, 화면 폭이 달라져도 폰트 크기가 변하지 않음
- `--layout-modal-search`는 `52rem(832px)` 고정 → 1920px 이상 화면에서 양쪽 여백이 과도해지고, 4K에서는 모달이 화면 대비 현저히 작아 보임
- 인물 페이지(`personPageLayout`)는 `minmax + 1fr` 유동 그리드를 사용해 넓은 화면에서 레이아웃이 자연스럽게 확장되지만, 폰트는 고정이라 레이아웃 확장 대비 글자가 상대적으로 작아 보이는 불균형 발생
- 대상 해상도: 375px(모바일 최소) ~ 2560px(4K)

## 결정

`tokens.css`의 `--font-size-*` 8단계와 `--layout-modal-search`를 `clamp(최소, vw기반, 최대)`로 전환.

**기준점: 1470px** (작업 당시 기준 화면 폭)
- clamp mid 값 = `현재px ÷ 1470 × 100vw` — 1470px에서 기존값과 동일하게 계산됨
- 최솟값: 기존 px보다 1~2px 낮게 (모바일 가독성 유지)
- 최댓값: 기존 px보다 2~10px 높게 (4K 스케일, 과도한 확대 방지)

| 토큰 | 이전 | 이후 | 범위 |
|------|------|------|------|
| `--font-size-xs` | `0.625rem` | `clamp(0.5625rem, 0.68vw, 0.75rem)` | 9–10–12px |
| `--font-size-sm` | `0.75rem` | `clamp(0.6875rem, 0.82vw, 0.875rem)` | 11–12–14px |
| `--font-size-base` | `0.8125rem` | `clamp(0.75rem, 0.88vw, 1rem)` | 12–13–16px |
| `--font-size-lg` | `0.875rem` | `clamp(0.8125rem, 0.95vw, 1.125rem)` | 13–14–18px |
| `--font-size-xl` | `1rem` | `clamp(0.875rem, 1.09vw, 1.25rem)` | 14–16–20px |
| `--font-size-2xl` | `1.125rem` | `clamp(1rem, 1.22vw, 1.5rem)` | 16–18–24px |
| `--font-size-3xl` | `1.25rem` | `clamp(1.125rem, 1.36vw, 1.75rem)` | 18–20–28px |
| `--font-size-4xl` | `1.375rem` | `clamp(1.25rem, 1.5vw, 2rem)` | 20–22–32px |
| `--layout-modal-search` | `52rem` | `clamp(20rem, 57vw, 90rem)` | 320–832–1440px |

## 결과

- 1470px: 기존과 동일하게 보임 (기준값 유지)
- 1920px 이상: 폰트·모달이 레이아웃 확장에 비례해 자연스럽게 커짐
- 375px: 최솟값 clamp로 너무 작아지지 않게 보장
- 컴포넌트 Module의 `var(--font-size-*)` 참조는 수정 없이 자동 반영
- 관련 Changelog: [2026-05-28-feat-responsive-tokens.md](../changelog/2026-05-28-feat-responsive-tokens.md)
