# Change Log — 2026-06-05 · fix · 마이페이지 북마크 lazy fetch

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/news-bookmarks-store` |
| 커밋 | (커밋 후 갱신) |

## 요약

마이페이지 진입 시 관심종목·계정 탭에서도 `bookmarks`·`bookmarks/dates`가 나가던 문제를, `tab === 'news'`일 때만 `useMyPageBookmarks`가 fetch하도록 바꿨다. 삭제 후 `newsBookmarkStore` reload로 ★ 상태도 동기화한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useMyPageBookmarks` | 마이페이지 마운트 시 항상 fetch | `enabled` 옵션, news 탭에서만 |
| 관심종목 탭 Network | `bookmarks`·`dates` 포함 | 북마크 API 0회 |
| 마이페이지 뉴스 삭제 | 목록만 갱신 | `newsBookmarkStore.reload()` 연동 |

## 파일

- `src/hooks/useMyPageBookmarks.ts`
- `src/pages/MyPage.tsx`

## 확인

- [ ] 마이페이지 관심종목 탭 — `bookmarks`·`dates` 0회
- [ ] 저장 뉴스 탭 전환 시 목록·날짜 집계 정상 로드
- [ ] 마이페이지에서 뉴스 삭제 후 피드/종목 상세 ★ 해제
- [ ] `npm run lint:js` · `npm run build` 통과
