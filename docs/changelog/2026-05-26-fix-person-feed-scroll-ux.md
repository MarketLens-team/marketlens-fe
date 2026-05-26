# Change Log — 2026-05-26 · fix/person-feed-scroll-ux

인물 상세 anchored 피드 스크롤·맨 위로 FAB·newer 로드 UX 정리.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-anchored-feed.md](./2026-05-26-fix-person-anchored-feed.md) |

## 증상

- 위로 스크롤 시 `newer`가 스크롤 없이 연속 호출되거나, 반대로 한 번만 로드되고 멈춤.
- 맨 위로 버튼이 sticky 레일·스크롤 임계값 때문에 안 보이거나 스크롤 시 움직임.
- 프로필·피드 레이아웃이 prepend 시 어색함.

## 수정

| 영역 | 내용 |
|------|------|
| `useInfiniteScroll` | 상단 margin 64px. `requireUserScrollUp` + 휠/터치 시 `attemptUpLoad`. up 방향 자동 연쇄 재시도 제거. |
| `useAnchoredFeed` | newer 최소 로딩 320ms. 커서 id 변경 시 재요청 허용. |
| `PageFabRail` | viewport `fixed` + 인물 페이지 `alwaysVisible`. 그리드 4열은 `fabRail` spacer. |
| `PersonDetailPage` | sticky 프로필·newer 로딩 슬롯·loadMore 에러 표시. |
| `usePersonDetail` | `statementId` 시 cursor/around 경쟁 제거·loadNewer/older 에러 처리. |
| 뉴스·종목 anchored | 상단 newer 동일 규칙 (`ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX`). |

## Notes

- 화면 레이아웃(프로필 sticky 등) 추가 다듬기 필요할 수 있음.
- `images/` untracked.
