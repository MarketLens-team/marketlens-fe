# 종목 상세 뉴스 — 긍정/부정 필터·무한 스크롤 동작 불일치

| 항목 | 내용 |
|------|------|
| 상태 | fix in progress |
| 범위 | FE (mock/API 분기), 필요 시 BE 확인 |
| 관련 커밋 | `6f9ab8a`, `77ddadd`, `22ca4f1`, `84131dd`, `4f147f9` |
| 작성일 | 2026-05-26 |
| GitHub # | (등록 후 기입) |
| fix changelog | (수정 후 `docs/changelog/YYYY-MM-DD-fix-stock-news-pagination.md` 링크) |
| Prompt experiment | [탐색 범위 vs 컨펌 후](../prompt-experiments/2026-05-26-stock-news-pagination-scope.md) |

---

## 1. 증상

- 화면: `/stock/005930` 관련 뉴스, 감성 분포에서 긍정·부정 건수/비율이 큼.
- 기대: 무한 스크롤로 더 많은 뉴스 로드.
- 체감: 목록이 끊기거나(예: 4건), 더 이상 안 붙는 것 같음.

---

## 2. 실측 데이터 (API, `005930`)

### 필터별 첫 페이지

```
--- positive filter ---
items 20 / hasNext True
nextCursor 2026-05-25T08:40:00Z|10518

--- negative filter ---
items 20 / hasNext True
nextCursor 2026-05-25T09:28:00Z|10495
```

### 전체 + 2페이지 샘플

```
page2 items 4 / hasNext True   # (limit=4 등으로 호출한 실험일 수 있음)
total 20 / hasNext True
negative-ish 0                 # positive 필터 응답에 음수 점수 0건
```

### positive 필터 연속 페이지 (limit=20)

```
page 1: 20 items, hasNext=True
page 2: 20 items, hasNext=True, cursor=2026-05-25T05:57:00Z|10559
page 3: 20 items, hasNext=True, cursor=2026-05-25T00:30:00Z|10609
page 4: 20 items, hasNext=True, cursor=2026-05-23T20:49:00Z|10671
page 5: 20 items, hasNext=True, cursor=2026-05-22T12:06:00Z|10143
→ 5페이지 합계 100건
```

### sentiment-breakdown (같은 종목)

- 긍정 53건 (ratio 54), 중립 3건 (3), 부정 43건 (43), `totalCount` 99  
- OpenAPI `Category.ratio`는 **0–100 정수** — 막대 `width: ${percent}%`와 스펙 일치.

**API 모드 결론:** 서버 커서·`sentiment` 필터는 **정상**. “비율이 커서 API가 막는다”는 **재현 없음**.

---

## 3. changelog / git 조사

### 관련 커밋

| 커밋 | 요약 |
|------|------|
| `6f9ab8a` | `GET /news/feed/{ticker}/cursor`, 커서 `\|` → `%7C` |
| `77ddadd` | `IntersectionObserver` 무한 스크롤, 스피너, 맨 위로 FAB |
| `22ca4f1` | API 모드에서 `sentiment` 쿼리; mock는 클라이언트 `filterNews`만 |
| `84131dd` | 뉴스 섹션 삭제 |
| `4f147f9` | 위 삭제 revert (현재 UI 복구) |

### `22ca4f1` 핵심 분기

```ts
const useApiNewsFilter = !isMockDataSource()
// API: fetchStockNewsFeedCursor(..., { sentiment })
// Mock: filterNews(newsItems, newsFilter) — mock cursor는 sentiment 무시
```

### UI (무한 스크롤, `77ddadd`)

```tsx
{pagination.hasNext && !loadingNewsFilter ? (
  <div className={styles.newsScrollFoot}>
    <div ref={newsSentinelRef} className={styles.newsSentinel} aria-hidden />
    {loadingMoreNews ? <FeedLoadingSpinner /> : null}
  </div>
) : null}
```

- 페이지 번호 UI **없음** (설계: [ui-product-overview.md](../design/ui-product-overview.md)).
- `?newsId=` 진입 시 필터 **전체** 리셋 ([search-modal changelog §5b98431](../changelog/2026-05-21-feat-design-refresh-search-modal.md)).

---

## 4. 원인 후보

### A. Mock 모드 (`VITE_USE_MOCK_DATA` 미설정 시 dev 기본 mock)

| 항목 | 내용 |
|------|------|
| 데이터 | `stock.mock.ts` 뉴스 **4건** |
| hasNext | 픽스처 `hasNext: true` vs cursor 로직 `nextOffset < all.length` **불일치** |
| 필터 | mock cursor **`sentiment` 미적용**, 탭은 `filterNews`만 |
| 체감 | 4건만 보임, 스크롤해도 더 안 붙음 |

### B. API 모드 (`.env`에 `VITE_USE_MOCK_DATA=false`)

- §2 실측대로 **페이지네이션·필터 정상**.
- 남는 후보: **IntersectionObserver**(`main[data-scroll-root]`), 센티넬 미노출, 스크롤 부족.

### C. UX

- (d) “버튼이 없어서 안 되는 것 같다” — 설계상 무한 스크롤만 제공.

### 가설 vs 결과

| 가설 | 결과 |
|------|------|
| 긍정/부정 비율·건수가 커서 실패 | **근거 없음** (API 정상) |
| 페이지네이션 자체 불가 | mock 4건 + hasNext 불일치 **유력**; API는 스크롤/옵저버 의심 |
| 긍정/부정 탭만 실패 | API는 `sentiment` 전달; **mock만** 서버 필터 없음 |

---

## 5. 확인 필요 (수정 전 컨펌)

- [x] 환경: `VITE_USE_MOCK_DATA=false` 여부
- [x] 증상:
  - [x] (a) 스크롤해도 더 안 붙음
  - [ ] (b) 긍정/부정 탭에서만
  - [ ] (c) 처음부터 4건에서 끝
  - [ ] (d) 버튼 없어서 “안 됨”으로 보임

---

## 6. 수정 범위 후보 (컨펌 후)

| 대상 | 작업 |
|------|------|
| Mock | 픽스처 확장, `hasNext` 정합, mock cursor `sentiment` 반영 |
| API/FE | `useInfiniteScroll` — 센티넬 callback ref 재관찰, `rootMargin` 하단 240px (`0px 0px 240px 0px`) |
| UI (선택) | “더 보기” 버튼 |

---

## 7. 후속 액션

- [ ] §5 컨펌
- [ ] GitHub Issue 등록 → 위 표 `GitHub #` 갱신
- [ ] 수정 PR: `Fixes #N`
- [ ] **fix changelog** 작성 (`docs/changelog/YYYY-MM-DD-fix-stock-news-pagination.md`) — **§6 확정·머지 후**
- [ ] 이 파일 상태 → `fixed`, §8 해결 요약 추가
- [ ] 구조 결정 시 DDR (선택)

---

## 8. 해결 (fixed 시에만 작성)

_아직 없음._

```md
## 해결 요약
- 원인:
- 변경 파일:
- fix changelog: [../changelog/YYYY-MM-DD-fix-stock-news-pagination.md](...)
- PR:
```
