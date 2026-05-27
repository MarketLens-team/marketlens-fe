# Change Log — 2026-05-26 · fix/stock-news-pagination

API 모드에서 종목 상세 **관련 뉴스 무한 스크롤**이 끝까지 내려도 추가 로드되지 않던 문제 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `ddd80ec` |
| 조사 이슈 | [issues/2026-05-26-stock-news-pagination.md](../issues/2026-05-26-stock-news-pagination.md) |
| Prompt experiment | [prompt-experiments/2026-05-26-stock-news-pagination-scope.md](../prompt-experiments/2026-05-26-stock-news-pagination-scope.md) |

## 증상

- `VITE_USE_MOCK_DATA=false`, `/stock/005930` — 스크롤해도 뉴스가 더 붙지 않음 (증상 a)
- API `cursor`·`hasNext`는 정상 (이슈 §2)

## 원인

- `useInfiniteScroll`: 필터 로딩 등으로 **센티넬이 remount**될 때 `IntersectionObserver` effect가 재실행되지 않아, 분리된 DOM 노드를 계속 관찰
- `rootMargin` 기본값 `240px 0px 0px`(상단만) — 하단 preload에 맞지 않음

## 수정

| 파일 | 내용 |
|------|------|
| `src/hooks/useInfiniteScroll.ts` | 센티넬 **callback ref** + `sentinelEl` state로 attach/detach 시 observer 재연결 |
| 동일 | 기본 `rootMargin` → `0px 0px 240px 0px` |

## 확인

- `main[data-scroll-root]` 본문을 뉴스 목록 하단까지 스크롤 → `cursor` 2페이지 이상 요청
- 긍정/부정 탭 전환 후에도 추가 로드 동작

## Notes

- Mock 4건·`hasNext` 불일치는 **미수정** (별도 이슈/백로그 가능)
- UI “더 보기” 버튼은 설계상 무한 스크롤 유지
