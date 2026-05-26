# Change Log — 2026-05-26 · fix/anchored-feed-pagination

인물·종목 anchored 피드(`around` / `newer` / `older`) 양방향 페이지네이션 안정화. BE 커서 규칙 정합·프론트 워밍 제거·`statementId` 클릭 해제 제거.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| BE | `NewsService` / `PersonService` — `newerCursor` = 배치 첫 항목, `olderCursor` = 배치 마지막 항목 |

## 증상

- `older`만 연속 호출되거나, 한 방향 스크롤 후 반대 방향이 막힘.
- API `olderCursor`가 배치 최신글 id를 가리킬 때 같은 페이지 반복·0건 merge.
- 바깥 클릭 시 `?statementId=` 제거 → anchored 해제 → cursor(limit) 피드로 되돌아감.

## 수정 (프론트)

| 파일 | 내용 |
|------|------|
| `useAnchoredFeed.ts` | warm/prefetch 제거. newer/older **edge ref 분리**(한 방향 로드가 반대 커서 덮어쓰지 않음). 커서 id 기준 중복·stuck 처리. |
| `newsClient.ts` | 전체 뉴스 anchored `GET /api/v1/news/feed/around|newer|older` (`/all/around` 아님) |
| `anchoredFeedCursor.ts` | BE 보정용 `buildAnchoredItemCursor` / `correctOlder*` 제거. `anchoredCursorsEqual`·merge만 유지. |
| `useInfiniteScroll.ts` | 로드 종료 후 센티널이 보이면 **1회** 재시도 (무한 연쇄 제거). |
| `usePersonStatementFocus.ts` | `pointerdown`으로 `statementId` 쿼리 해제 제거 — 초록 강조·anchored 유지. |

## Notes

- BE 커서 수정 후에도 단방향 응답이 반대 edge를 덮을 수 있어 merge는 방어적으로 유지.
- `images/` 에셋은 본 변경과 무관(untracked).
