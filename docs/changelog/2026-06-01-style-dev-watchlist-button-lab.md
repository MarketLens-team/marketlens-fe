# Change Log - 2026-06-01 · style: dev 관심종목 버튼 시안

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 작업일 | 2026-06-01 |

## 요약

`/dev/watchlist-button` 페이지를 추가해 관심종목 버튼 시안을 비교할 수 있게 했다.  
최종 테스트 기준은 C안(별+텍스트 단일 버튼)으로 정리했고, 별/텍스트가 함께 hover 반응하도록 조정했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/DevWatchlistButtonPage.tsx` | 관심종목 버튼 시안 비교 페이지 추가, C안 추천/상단 배치 |
| `src/pages/DevWatchlistButtonPage.module.css` | C안 스타일 정리(별 박스 경계선 제거, 별만 warning 색, 간격/폰트 톤 조정, 통합 hover) |
| `src/router/index.tsx` | `/dev/watchlist-button` 라우트 추가 |
| `src/pages/DevActionButtonPage.tsx` | `/dev` 링크 목록에 watchlist/sort 버튼 시안 링크 추가 |
| `src/pages/DevActionButtonPage.module.css` | `/dev` 루트 페이지 스크롤 가능하도록 `height: 100%`, `overflow-y: auto` 적용 |

## 확인

- [ ] `/dev`에서 세로 스크롤 가능
- [ ] `/dev/watchlist-button` C안에서 별+텍스트가 함께 hover 반응
- [ ] C안에서 별 박스 경계선 없음, 별 아이콘만 warning 색으로 변경
