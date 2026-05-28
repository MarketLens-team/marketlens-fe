# Change Log — 2026-05-28 · feat: 반응형 토큰 clamp() 전환 (375px~2560px)

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/responsive-layout` |
| 작업일 | 2026-05-28 |
| 관련 DDR | [DDR-0003](../ddr/0003-responsive-clamp-tokens.md) |

## 요약

데스크탑·4K 사용자에서 폰트가 레이아웃 대비 상대적으로 작아 보이고, 검색 모달이 832px에 고정되어 넓은 화면에서 여백이 과도했던 문제를 해결.
1470px을 기준(mid)으로, `clamp(최소, vw기준, 최대)`를 적용해 375px~2560px 전 구간에서 자연스럽게 스케일되도록 전환.

## Changed

| 파일 | 내용 |
|------|------|
| `src/styles/tokens.css` | `--font-size-xs~4xl` 8단계 → `clamp()` 전환 (1470px 기준값 유지) |
| `src/styles/tokens.css` | `--layout-modal-search` `52rem` → `clamp(20rem, 57vw, 90rem)` |
| `src/styles/tokens.css` | `--layout-page-wide-cap` `120rem` → `160rem` (2560px 상한) |
| `src/styles/tokens.css` | `--layout-sidebar-width` `196px` → `clamp(196px, 13vw, 260px)` |
| `src/components/mypage/ProfileLayout.module.css` | 본문 48rem 고정 해제 · nav↔본문·우측 여백 — [상세](./2026-05-28-fix-mypage-profile-content-width.md) |
| `src/pages/MyPage.module.css` | `.page` `width: 100%` |
| `src/components/ui/Modal.module.css` | 기본 모달 `max-width` `clamp(480px, 38vw, 680px)` |
| `src/components/common/DetailAccordionSidebar.module.css` | 매직 넘버 `78px` → `var(--layout-top-strip-height)` (82px, 4px 오차 수정) |
| `src/components/dashboard/NewsDetailModal.module.css` | `max-width` 고정 `760px` → `clamp(560px, 52vw, 920px)` |

## 설계 노트

- 기준값(mid): 1470px — 기존 사용자의 화면 폭. 이 폭에서 clamp mid가 기존 px값과 동일하게 계산됨
- 폰트 최솟값: 기존값보다 1~2px 낮게 잡아 375px(모바일)에서도 가독성 유지
- 폰트 최댓값: 4K(2560px)에서 과도하게 커지지 않도록 1~2단계 위로 제한
- 모달 최솟값 `20rem`: 모바일에서 좌우 여백 확보 후 전체 폭을 채우는 수준
- 모달 최댓값 `90rem`: 4K에서 1440px 상한 — 가독성과 비율 균형
- 컴포넌트 Module의 `var(--font-size-*)` 참조는 변경 없음 (토큰 교체로 자동 반영)
- 관련 DDR: [DDR-0003](../ddr/0003-responsive-clamp-tokens.md)
