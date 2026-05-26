# Change Log — 2026-05-26 · fix/person-page-grid-symmetry

인물 트래커·상세 3열 그리드 통일 및 좌우 바깥 여백 대칭.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-feed-scroll-ux.md](./2026-05-26-fix-person-feed-scroll-ux.md) |

## 증상

- 인물 상세(`/person/:id`)가 트래커와 달리 5열·좌측 FAB spacer(76px)로 TOP5가 안쪽으로 밀림.
- `detailFeedCol`이 `mainGrid` 행 배치에서 빠져 **TOP5 | 종목 | 피드** 순으로 깨짐.
- 그리드 4열 `fabRail`만 두면 우측 카드가 화면 끝에 붙어 좌측 여백과 비대칭.
- 사이드바 폭(196px) 기준 gutter 보정은 `hideSidebar` 기본 레이아웃과 맞지 않음.

## 수정

| 파일 | 내용 |
|------|------|
| `personPageLayout.module.css` | 3열(`TOP5 \| 피드 \| 종목`)만 사용. `leftAside`/`feedCol`/`detailFeedCol`/`rightAside`에 `grid-column` 명시. `fabRail` 열 제거. |
| `PersonTrackerPage.tsx` | 그리드 내 `fabRail` spacer 제거 — FAB는 `PageFabRail` fixed. |
| `PersonDetailPage.tsx` | `mainGrid` 공유, 좌·우 `detailSideSpacer` 제거. |
| `PersonDetailPage.module.css` | 5열 `detailGrid`·sticky 중복 스타일 제거. `.page`를 트래커와 동일 셸. |
| `PersonDetailSidebars.tsx` | `leftAside`/`rightAside` + `sideSticky` (트래커와 동일 래퍼). |

## Notes

- 좌·우 카드 바깥 여백 = `Layout` 본문 `padding-inline`(`clamp(24px, 2.5vw, 48px)`). FAB는 우측 패딩 영역에 fixed 겹침.
- `images/` untracked.
