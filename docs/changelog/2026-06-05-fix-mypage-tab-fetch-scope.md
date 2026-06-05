# Change Log — 2026-06-05 · fix · 마이페이지 탭별 fetchMyPage scope

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/react-query` |

## 요약

뉴스·계정 탭에서 관심종목 UI에 쓰이지 않는 `overview`·`batch`·`watchlist`가 `fetchMyPage`로 함께 나가던 문제를, 탭별 `scope`로 분리했다.

## Changed

| 탭 | Before (`fetchMyPage` 항상 full) | After |
|----|----------------------------------|-------|
| 관심종목 | settings · me · overview · batch · watchlist | 동일 (`scope: watchlist`) |
| 뉴스 · 계정 | 위 full + bookmarks 별도 | `scope: shell` — settings · me만 |

## 파일

- `src/data/clients/myPageClient.ts`
- `src/pages/MyPage.tsx`
- `src/hooks/useMyPage.ts`

## 확인

- [ ] `/mypage?tab=news` — `overview`·`batch`·`watchlist` 0회, `bookmarks`·`dates`만
- [ ] `/mypage` 관심종목 탭 — summary·watchlist 테이블 정상
- [ ] 계정 탭 — 프로필·알림 설정 정상
- [ ] 관심종목 탭 전환 시 watchlist 데이터 로드
