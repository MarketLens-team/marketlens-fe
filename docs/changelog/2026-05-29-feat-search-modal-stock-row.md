# Change Log — 2026-05-29 · feat: 검색 모달 종목 행 별·행 클릭 진입

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/home-onboarding` |
| 작업일 | 2026-05-29 |

## 요약

통합 검색 모달의 **종목 결과 행**을 전체 종목 목록과 맞춰 정리했다. 좌측 `StockWatchlistStarButton`(☆/★)으로 관심 추가·해제, **「관심추가」「상세보기」 버튼 제거**, 행 클릭·Enter 시 종목 상세 진입.

## Changed

| 파일 | 내용 |
|------|------|
| `components/common/TopNavSearchModal.tsx` | `StockSearchRow` — `useServerWatchlist`(섹터당 1회) · 행 `button` + `data-search-nav-primary` |
| `components/common/TopNavSearchModal.module.css` | `searchRowBtn` · `searchRowStock` grid · 선택/호버 링 (li 기준) |

## UX

- 별: 서버 watchlist · 비로그인 → 로그인 모달
- 키보드: 기존 ↑↓ 선택 + Enter → `data-search-nav-primary` 클릭(행 진입)
- 인물 행 UI는 변경 없음

## 확인

- [ ] 검색 모달 종목 — 별 토글 · 행 클릭 상세 이동
- [ ] Enter로 선택 행 진입
- [ ] 별 클릭 시 행 진입 없음
