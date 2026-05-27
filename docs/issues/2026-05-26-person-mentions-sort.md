# Issue — 인물 발언 피드 시간순 깨짐

## 상태
`fixed` (FE `merge` 정렬·중복 제거 + `loadMore` 직렬화)

## 증상

- 인물 상세 `/person/:id?statementId=` — 발언 목록이 **최신순이 아님** (예: 2일 전 → 3일 전 → 맨 아래 22시간 전).
- 포커스 자동 로드·무한 스크롤로 페이지를 이어 붙인 뒤 두드러짐.

## 원인 (FE)

1. **`mergePersonMentionsFeedPage`** — 커서 페이지를 `[...prev, ...more]`만 하고 **`publishedAt` 정렬·id 중복 제거 없음**.
2. **`loadMore` 경쟁** — `usePersonStatementFocus` 자동 로드와 `useInfiniteScroll`이 동시에 `loadMore`를 호출하면, 응답 도착 순서대로 합쳐져 **시간순이 뒤섞임** (API는 페이지 단위로는 최신순일 수 있음).
3. **Mock** — `filterMockStatementsForParams`가 배열 인덱스 순 커서만 사용, 정렬 없음 (로컬 mock 시 동일 패턴).

## 수정 (요약)

| 파일 | 내용 |
|------|------|
| `personMapper.ts` | 병합 후 `publishedAt` 내림차순 + `id` dedupe |
| `personClient.ts` | mock 목록 `publishedAt` desc 정렬 |
| `usePersonDetail.ts` · `usePersonTracker.ts` | `loadMore` in-flight 가드 |
| `usePersonStatementFocus.ts` | 포커스 1회 스크롤 (별도 커밋) |

## 확인

- [ ] 인물 상세: 스크롤·추가 로드 후에도 최신 → 과거 순
- [ ] `?statementId=` 진입 후 자동 로드해도 순서 유지
- [ ] 인물 트래커 `/person` 동일
