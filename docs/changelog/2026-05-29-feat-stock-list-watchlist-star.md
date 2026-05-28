# Change Log — 2026-05-29 · feat: 종목 목록 관심종목 별 토글

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/home-onboarding` |
| 작업일 | 2026-05-29 |
| 커밋 | `1dc5660` |

## 요약

**전체 종목**(`/stock`) 테이블 각 행 앞에 관심종목 **별(☆/★) 토글**을 추가했다. 로그인 시 서버 `watchlist` API와 동기화하고, 비로그인 시 로그인 모달을 연다. 행 클릭(종목 상세 이동)과는 `stopPropagation`으로 분리했다.

종목 **상세** 헤더의 `PillButton` 관심 UI는 이번 범위에서 변경하지 않았다(별도 작업 예정).

## Changed

| 파일 | 내용 |
|------|------|
| `components/stock/StockOverviewTable.tsx` | `useServerWatchlist` · `StockWatchlistStarButton` |
| `components/stock/StockOverviewTable.module.css` | `stockLead` 간격 (`space-2`) |
| `components/stock/StockWatchlistStarButton.tsx` | 공통 별 버튼 (☆/★, `aria-pressed`) |
| `components/stock/StockWatchlistStarButton.module.css` | 미등록 muted · 등록 `--color-warning` |
| `hooks/useServerWatchlist.ts` | `fetchWatchlist` · `add`/`remove` · mock·비로그인 분기 |

## UX

| 상태 | 표시 |
|------|------|
| 미등록 | ☆ (`--color-text-muted`) |
| 등록됨 | ★ (`--color-warning`) |
| 호버 | 골드 톤 강조 |

## 설계 노트

- 목록 우측 `PillButton` 대신 코인마켓캡 스타일 **행 선두 별** — 테이블 열 추가 없이 `stockLead` 안에 배치.
- `StockWatchlistStarButton`은 상세 페이지에서도 재사용 가능하나, 상세는 사용자가 별도 UI로 수정 예정.
- 로컬 `watchlistStore`(검색 모달)와 별도 — 본 기능은 **서버 watchlist** 기준.

## 확인

- [ ] `/stock` — 별 클릭 시 관심 추가·해제
- [ ] 로그인 후 홈 워치리스트·마이페이지에 반영
- [ ] 비로그인 — 별 클릭 시 로그인 모달
- [ ] 별 클릭 시 행 상세 이동 없음 · 행 본문 클릭 시 `/stock/:code` 이동
