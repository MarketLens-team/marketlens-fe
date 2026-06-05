# Change Log — 2026-06-05 · fix · 뉴스 피드 수동 effect StrictMode dedupe

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/react-query` |

## 요약

`useAsyncData` 밖에서 `useEffect`로 직접 fetch하던 뉴스 피드·오늘 뉴스 사이드바에 `dedupeAsync`를 적용해 dev StrictMode 이중 mount 시 `today-news`·`cursor`가 2회 나가던 문제를 줄였다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useTodayNewsStocks` | effect마다 `fetchStockTodayNews` | `dedupeAsync('todayNews:stocks')` |
| `useNewsFeedPage` bootstrap | cursor fetch 직호출 + `replaceLatestItems` deps | cursor만 dedupe, callback은 ref |
| `dedupeAsync` | TTL 옵션만 | `STRICT_MODE_DEDUPE_TTL_MS` 상수 export |

## 파일

- `src/lib/dedupeAsync.ts`
- `src/hooks/useAsyncData.ts`
- `src/hooks/useTodayNewsStocks.ts`
- `src/hooks/useNewsFeedPage.ts`

## 확인

- [ ] Network Clear → `/news` — `today-news`·`cursor?limit=20` 각 1회
- [ ] 전체/관심 탭 전환 시 cursor 1회씩
- [ ] `npm run typecheck` 통과
