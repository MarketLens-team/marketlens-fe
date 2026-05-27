# Change Log — 2026-05-26 · fix/person-mentions-sort

인물 발언 피드가 커서 병합 후 시간순이 깨지던 문제 수정. 발언·뉴스 포커스 시 스크롤 재실행으로 무한 스크롤이 막히던 문제도 함께 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 이슈 | [issues/2026-05-26-person-mentions-sort.md](../issues/2026-05-26-person-mentions-sort.md) |

## 원인

- `mergePersonMentionsFeedPage`가 페이지를 이어붙이기만 하고 `publishedAt` 정렬·id dedupe 없음.
- 포커스 자동 `loadMore`와 무한 스크롤 `loadMore`가 겹치면 응답 순서대로 합쳐져 순서 뒤섞임.
- 포커스 스크롤 effect가 `mentions` 갱신마다 재실행되어 아래 스크롤·추가 로드 방해.

## 수정

| 파일 | 내용 |
|------|------|
| `personMapper.ts` | `normalizePersonMentionsList` — 최신순·dedupe |
| `personClient.ts` | mock 목록 `publishedAt` desc |
| `usePersonDetail.ts` · `usePersonTracker.ts` | `loadMore` in-flight 가드 |
| `usePersonStatementFocus.ts` | 포커스 대상 1회만 스크롤 |
| `StockDetailContent.tsx` | 뉴스 포커스 1회만 스크롤 |
