# Change Log — 2026-06-11 · fix · 관심종목 10건 초과 스낵바 문구

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 전체 종목 `/stock` · 검색 모달 · 종목 상세 관심 ★ |
| API | `W002` — 관심종목 최대 10개 |

## 요약

관심종목이 10개 찬 뒤 추가를 시도하면 「종목 저장 처리에 실패했습니다」 대신 한도 안내를 보여 준다. 클라이언트 선검사와 API `W002` 응답을 모두 처리한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 10건 초과 추가 | generic 실패 스낵바 | **「관심종목은 최대 10개까지 추가할 수 있습니다.」** |
| `useServerWatchlist.toggle` | `'error'`만 반환 | `'limit'` 분기 (선검사 + `W002`) |
| 기타 실패 | 「종목 저장 처리에 실패했습니다」 | 「종목 저장에 실패했습니다」 |

## 후속 (종목 상세)

- `StockDetailContent` — `addWatchlistItem` 직접 호출 제거 → `useServerWatchlist.toggle` 통일
- `isWatchlistLimitError` — `watchlistClient`가 감싼 `Error.message`·W002 본문도 인식

## 파일

- `src/lib/watchlistError.ts`
- `src/hooks/useServerWatchlist.ts`
- `src/components/stock/StockOverviewTable.tsx`
- `src/components/common/TopNavSearchModal.tsx`
- `src/components/stock/StockDetailContent.tsx`

## 확인

- [ ] 관심 10개 등록 후 전체 종목에서 ★ 추가 → 한도 문구
- [ ] 검색 모달에서 동일
- [ ] 종목 상세에서 동일 (API `W002`)
- [ ] 10개 미만 추가·해제 스낵바는 기존과 동일
