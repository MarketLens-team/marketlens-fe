# Change Log — 2026-05-28 · feat: 관심 종목 낙관적 삭제 애니메이션

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

`MyPageWatchlistTable`에 공통 `useOptimisticRemove` 훅 + `optimisticRemove.module.css`를 적용.
북마크 삭제와 동일한 낙관적 제거 패턴으로 관심 종목 삭제 UX 통일.
API 완료 후 `keepPreviousData: true` 재조회로 카운트(watchlistCount)도 플래시 없이 갱신.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageWatchlistTable.tsx` | `useOptimisticRemove` 훅 적용 · `code → id` 매핑 어댑터 · `removingCode` prop 제거 · `remove.item / remove.itemRemoving` 클래스 `<tr>`에 적용 |
| `pages/MyPage.tsx` | `handleRemove` fire-and-forget 전환 · API 완료 후 `setRefreshKey` 재조회 · `removingCode` 상태 제거 · `useAsyncData`에 `keepPreviousData: true` 추가 |

## 설계 노트

- `MyPageWatchlistRow`는 `code` 필드를 식별자로 사용 → `rows.map(r => ({ ...r, id: r.code }))` 어댑터로 훅 제약(`T extends { id: string }`) 충족
- `keepPreviousData: true`: 재조회 시 기존 데이터를 유지해 화면 플래시 방지. 카운트 등 집계 데이터는 API 완료 후 자연스럽게 갱신
- API 실패 시 아이템은 페이지 재방문 시 복원 (북마크와 동일한 트레이드오프)
- 관련 설계 문서: `docs/design/optimistic-remove-animation.md`
