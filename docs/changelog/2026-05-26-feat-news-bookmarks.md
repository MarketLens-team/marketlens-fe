# Change Log — 2026-05-26 · feat/news-bookmarks

뉴스 즐겨찾기(북마크) API 연동. 전체 뉴스 피드에서 저장·해제, 마이페이지에서 저장 목록 조회.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| BE API | `GET/POST/DELETE /api/v1/bookmarks` · OpenAPI `Bookmark` 태그 |
| 인증 | 북마크 API Bearer 필수 · 비로그인 토글 시 로그인 모달 |

## 요약

- **전체 뉴스** (`/news`, `mode=all`) — 행 메타에 ☆/★ 토글 · 로그인 시 `GET /bookmarks`로 ID Set 동기화
- **비로그인** — ☆ 클릭 시 `useAuthModalStore.open('login')`
- **마이페이지** (`/mypage`) — 「저장한 뉴스」 카드 · 제목·썸네일 클릭 → `/news?newsId=` anchored · × 해제
- **피드 응답** — `NewsFeedItemResponse`에 `bookmarked` 필드 없음 → 클라이언트 Set + 토글 API

## Added

| 파일 | 내용 |
|------|------|
| `data/types/bookmark.ts` | `NewsBookmarkDto` |
| `data/clients/bookmarkClient.ts` | `fetchNewsBookmarks` · `addNewsBookmark` · `removeNewsBookmark` |
| `data/mappers/bookmarkMapper.ts` | DTO → `MyPageBookmarkItem` |
| `hooks/useNewsBookmarks.ts` | Set 상태 · 낙관적 토글 · `B001`/`B002` 동기화 |
| `components/news/NewsBookmarkButton.tsx` | ☆/★ 버튼 |
| `components/mypage/MyPageBookmarkList.tsx` | 마이페이지 저장 목록 |
| `lib/buildNewsFeedRoute.ts` | `buildNewsFeedPath({ newsId })` → `/news?newsId=` |

## Changed

| 파일 | 내용 |
|------|------|
| `components/news/AllNewsListItem.tsx` | 북마크 props · 행 전체 `<a>` 제거(버튼·`<a>` 중첩 방지) · 제목·썸네일만 원문 링크 |
| `pages/NewsFeedPage.tsx` | `useNewsBookmarks` 연동 · `?newsId=` 시 탭 `all` 고정(`resolveInitialNewsFeedMode`) |
| `components/mypage/MyPageBookmarkList.tsx` | 외부 원문 대신 `buildNewsFeedPath` 내부 이동 |
| `pages/MyPage.tsx` | 저장한 뉴스 섹션 · 해제 후 목록 갱신 |
| `data/types/myPage.ts` | `MyPageBookmarkItem` |
| `data/constants/errorCodes.ts` | `B001` · `B002` |

## API 매핑

| API 필드 | UI |
|----------|-----|
| `newsArticleId` | 피드 `item.id` (string) |
| `publisherName` | `source` |
| `originalLink` | `url` |
| `sentimentLabel` | `sentiment` |

## 확인

- [ ] 로그인 — `/news` 전체 탭에서 ☆ → ★ · 재클릭 해제
- [ ] 비로그인 — ☆ 클릭 → 로그인 모달
- [ ] `/mypage` — 저장 목록 표시 · 기사 클릭 → `/news?newsId=` around·초록 강조 · × 해제
- [ ] `B001` 중복 추가 · `B002` 없는 삭제 시 UI Set 정합

## Notes

- 관심종목 뉴스 탭·종목 상세 뉴스 행에는 미적용(1차 범위: 전체 뉴스 + 마이페이지).
- mock: `bookmarkClient` 목록 빈 배열 · 토글은 메모리 Set.
