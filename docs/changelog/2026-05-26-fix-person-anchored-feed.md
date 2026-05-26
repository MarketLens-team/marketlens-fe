# Change Log — 2026-05-26 · fix/person-anchored-feed

인물 상세 `?statementId=` anchored 피드가 먹통이 되던 문제 수정. 뉴스 anchored와 동일한 양방향 커서·병합 규칙을 맞춤.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-anchored-feed-pagination.md](./2026-05-26-fix-anchored-feed-pagination.md) |

## 증상

- `?statementId=` 진입 후 위·아래 스크롤이 전혀 동작하지 않음 (뉴스 `/news?newsId=` 는 정상).
- `newer` 후 `older` 로드 시 타임라인 순서가 뒤섞여 보임 (API 배치 비정렬).
- 항목이 추가됐는데도 같은 id 커서로 다음 `newer`/`older` 요청이 막힘.

## 원인

1. `anchoredWarmComplete`가 `feedMode === 'anchored'`일 때만 true → `around` 실패·폴백(`latest`) 시 영구 false → 무한 스크롤 비활성.
2. `markCursorConsumed`가 `added > 0`이어도 커서 id가 같으면 재요청 차단.
3. `?statementId=` 진입 시 cursor 첫 페이지와 `around`가 동시에 로드되어 목록·커서 경쟁.

## 수정

| 파일 | 내용 |
|------|------|
| `useAnchoredFeed.ts` | `anchoredReady` = around 로딩 종료 시 true. `added > 0`이면 커서 소비 ref 해제. `mergeAnchoredFeedItemsWithCount` 사용. |
| `mergeFeedItems.ts` | anchored 병합 후 `publishedAt` 내림차순 정렬. |
| `usePersonDetail.ts` | `focusStatementId` 있을 때 cursor API 비활성 (`around`만). |
| `PersonDetailPage.tsx` | `focusFeedReady` = `anchoredWarmComplete` (중복 `loadingAround` 제거). |
| `anchoredFeed.ts` | `FeedState`·`LatestFeedPagination` 타입 문서화. |

## 동작 규칙 (anchored)

- `newer`: prepend, `newerCursor`만 갱신, `olderCursor` 유지.
- `older`: append, `olderCursor`만 갱신, `newerCursor` 유지.
- `items`: id 중복 제거 후 최신순 정렬.

## Notes

- `images/` 에셋은 본 변경과 무관(untracked).
