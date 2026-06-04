# Change Log — 2026-05-27 · fix · 마이페이지 프로필 사이드 nav 위치

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | feat/design-refresh |
| 커밋 | `b11e3f9` |
| 이슈 | [issues/2026-05-27-mypage-profile-sidenav-position.md](../issues/2026-05-27-mypage-profile-sidenav-position.md) |
| Prompt experiment | [prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md](../prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md) |

## 증상

마이페이지 좌측 탭(관심종목/뉴스/계정 설정)이 탭 전환 시 화면에서 위치가 바뀌어 보임.

## 원인

`main[data-scroll-root]` 안의 `position: sticky` + 탭별 콘텐츠 높이·스크롤바·scrollTop 차이. `fixed` 사용 시에도 상단 티커·topbar 오프셋 미반영.

## 수정

- `ProfileLayout`: nav `position: fixed`, `top`에 `--layout-top-strip-height` + `--main-pad-block`
- `Layout.main`: `scrollbar-gutter: stable`

## 확인

- `/mypage`에서 탭 전환·스크롤 후에도 좌측 nav가 상단 네비 아래 동일 좌표 유지
