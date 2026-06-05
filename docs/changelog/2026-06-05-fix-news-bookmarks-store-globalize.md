# Change Log — 2026-06-05 · fix · 뉴스 북마크 ID 전역 스토어

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/news-bookmarks-store` |
| 커밋 | (커밋 후 갱신) |

## 요약

`useNewsBookmarks` 인스턴스마다 `GET /bookmarks/ids`가 나가던 문제를 Zustand `newsBookmarkStore`로 합쳤다. 뉴스 피드·종목 상세가 동일 북마크 상태를 공유한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useNewsBookmarks` | 훅 마운트마다 local state + fetch | `newsBookmarkStore` 단일 상태 |
| 로그인 시 `bookmarks/ids` | 컴포넌트 수만큼 fetch 시도 | `isLoggedIn` 전환 시 스토어 1회 reload |
| `fetchBookmarkIds` | 매 호출 독립 HTTP | `dedupeAsync` 5s TTL, 비로그인 `[]` |

## 파일

- `src/store/newsBookmarkStore.ts` (신규)
- `src/hooks/useNewsBookmarks.ts`
- `src/data/clients/bookmarkClient.ts`

## 확인

- [ ] 로그인 후 뉴스 피드·종목 상세 — `bookmarks/ids` 1회
- [ ] 한 화면 ★ 토글 시 다른 화면 동기화
- [ ] `npm run lint:js` · `npm run build` 통과

## 제외 (후속, 동일 브랜치)

- 마이페이지 북마크 lazy (`tab === 'news'`) — 다음 커밋
