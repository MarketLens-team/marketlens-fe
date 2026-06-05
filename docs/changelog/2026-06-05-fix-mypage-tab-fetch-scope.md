# Change Log — 2026-06-05 · fix · 마이페이지 탭별 fetch scope

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/react-query` |

## 요약

마이페이지 API를 탭별로 완전 분리했다. 관심종목은 watchlist·overview·batch만, 계정은 settings·me만, 뉴스는 `fetchMyPage` 없이 북마크 훅만 사용한다.

## Changed

| 탭 | API |
|----|-----|
| 관심종목 | `watchlist`(캐시) · `overview` · `batch` |
| 계정 | `settings` · `me` |
| 뉴스 | `bookmarks` · `dates` (`useMyPageBookmarks`만) |

| 항목 | Before | After |
|------|--------|-------|
| 관심종목 `fetchMyPage` | settings · me · overview · batch · watchlist | overview · batch · watchlist |
| 뉴스 탭 | settings · me (shell) | `fetchMyPage` 비활성 |
| `syncAlertSettingsIfNeeded` | 모든 탭 | 계정 탭만 |
| 렌더 게이트 | `data && alertSettings` 공통 | 탭별 `profileReady` |

## 파일

- `src/data/types/myPage.ts`
- `src/data/mappers/myPageMapper.ts`
- `src/data/clients/myPageClient.ts`
- `src/data/clients/memberClient.ts`
- `src/pages/MyPage.tsx`

## 확인

- [ ] `/mypage` — `settings`·`me` 0회
- [ ] `/mypage?tab=news` — `settings`·`me`·`overview`·`batch` 0회
- [ ] `/mypage?tab=account` — `settings`·`me`만
- [ ] 탭 전환·관심종목 삭제·알림 설정 정상
