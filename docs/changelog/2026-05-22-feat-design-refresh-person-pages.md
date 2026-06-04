# Change Log — 2026-05-22 · feat/design-refresh (인물 페이지·검색 모달 UX)

브랜치 `feat/design-refresh`에서 진행한 **인물 트래커/상세 3열 레이아웃**, **기간 토글·로딩 UX**, **통합 검색 모달 키보드·라우팅** 작업 기록입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-22 |
| 관련 문서 | [검색 모달](./2026-05-21-feat-design-refresh-search-modal.md) · [인물 3열·API (5/21 전후)](./2026-05.md) (`b438230`~`86d3c7b` 등) |

### 프론트 커밋 (`feat/design-refresh`, 2026-05-22)

| 해시 | 요약 |
|------|------|
| `5895390` | 인물 페이지 기간 토글 시 패널만 갱신 (`keepPreviousData`) |
| `46fdcc0` | 종목 검색 1건일 때 뉴스 라우팅을 해당 종목으로 통일 |
| `a8b42be` | 검색 모달 키보드 내비·필터 탭 스크롤 밖 고정 |
| `8375914` | 인물 3열 카드 상단 정렬·좌우 sticky·상세 뒤로가기 |
| `2f82877` | 인물 상세 좌측 sticky 복구 (단일 행 그리드) |
| `76b5e6f` | 3열 카드 정렬 — `padding: 0` 덮어쓰기·뒤로가기 absolute |
| `3a688fd` | 인물 상세 **중앙 열 내부 스크롤 제거** |

## 요약

1. **인물 로딩** — `useAsyncData` `keepPreviousData`·`refreshing`으로 기간 토글 시 전체 스켈레톤 대신 해당 패널만 dim 처리.
2. **검색** — 단일 종목 검색 시 뉴스 행·라우트를 대표 종목 기준으로 통일; 모달에서 Enter·화살표·hover 중복 강조·탭 고정.
3. **인물 3열** — `personPageLayout.module.css` 공통 그리드; 상세는 `detailGrid` + 뒤로가기 offset으로 TOP5·프로필·연관 종목 **카드 상단** 정렬.
4. **스크롤** — 중앙 피드는 `Layout` `main[data-scroll-root]`만 스크롤; 좌·우만 `sticky`(+ 내용이 길 때 패널 내부 스크롤).

---

## Changed

### `useAsyncData` · 인물 훅 (`5895390`)

#### `src/hooks/useAsyncData.ts`

- **`keepPreviousData`** — 재요청 중에도 이전 `data` 유지, `loading`만 true.
- **`refreshing`** — `keepPreviousData`이고 기존 데이터가 있을 때 `loading && !isInitialLoading`에 해당.
- **`isInitialLoading`** — 첫 로딩(데이터 없음) 여부; 페이지는 이 값으로만 전체 스켈레톤 표시.

#### 적용 훅

| 훅 | 옵션 |
|----|------|
| `usePersonDetail` | `keepPreviousData: true` |
| `usePersonTracker` | `keepPreviousData: true` |
| `usePersonTopMentioned` | `keepPreviousData: true` |
| `usePersonFrequentStocks` | `keepPreviousData: true` |
| `usePersonMentionCount` | `keepPreviousData: true` |

#### `PersonTrackerPage` · `PersonDetailPage`

- `feedInitialLoading` / `topLoading` 등으로 **첫 진입**에만 `mainGrid`·`detailGrid` 스켈레톤.
- 기간 토글 시 `feedDimmed`·`listDimmed`·`heroRefreshing` 등 패널 단위 opacity만 적용.

---

### 검색 모달 — 단일 종목 뉴스 라우팅 (`46fdcc0`)

#### `src/lib/resolveSearchNewsRoute.ts`

- **`singleStockContext`** — 검색 결과 종목이 정확히 1개일 때 `SearchStockItem` 전달.
- `sourceType`·`stocks[]`와 무관하게 **대표 종목 코드·이름**으로 `/stock/:code?newsId=` 경로·라벨 통일.
- 초기(빈 검색어) fallback 뉴스 동작은 **변경 없음**.

#### `TopNavSearchModal.tsx`

- 종목 탭/전체 탭에서 `stocks.length === 1`이면 `singleStock`을 `resolveSearchNewsRoute`에 넘김.

---

### 검색 모달 — 키보드·필터 UI (`a8b42be`)

#### `TopNavSearchModal.tsx` · `.module.css`

| 동작 | 내용 |
|------|------|
| **Enter** | 검색 input 포커스 상태에서도 선택된 행으로 이동 (목록에 포커스 없어도 동작) |
| **↓ / ↑** | 결과 목록 이동; **마지막/첫 항목에서 순환하지 않음** |
| **hover vs keyboard** | 키보드로 선택된 행이 있으면 hover 강조 비활성 (`keyboardNavActive`) |
| **필터 탭** | 전체/종목/인물/뉴스 탭을 `filterChrome`으로 분리 → **스크롤 영역 밖** 고정 |

---

### 인물 3열 레이아웃 · 공통 그리드 (`8375914`)

#### 신규 `src/pages/personPageLayout.module.css`

- **`mainGrid`** — 3열 `minmax(14rem,18rem) | 1fr | minmax(14rem,18rem)`, 한 행 `align-items: start`.
- **`sideSticky`** — 좌·우 `position: sticky`, `max-height: calc(100vh - 4.5rem)`, `overflow-y: auto`.
- **`feedList`** — 첫 발언 카드 패딩·radius로 중앙 첫 카드와 사이드 패널 상단 시각 정렬 보조.

#### `PersonTrackerPage`

- 로컬 그리드 CSS 제거 → `personPageLayout` import.
- 좌 TOP5 · 중앙 타임라인 · 우 연관 종목, **페이지(`main`) 스크롤**.

#### `PersonDetailPage` (1차)

- 상단 전역 toolbar 제거 → **좌열** `PersonTimelineBackButton` + TOP5.
- 호버 툴팁: 「전체 인물 타임라인으로 이동」.
- 프로필 기간 토글은 히어로 카드 우상단 유지 (`f8c39f7` 이전 작업과 연속).

---

### 인물 상세 — 정렬·sticky 반복 수정 (`2f82877` · `76b5e6f` · `3a688fd`)

#### 문제·시도

| 이슈 | 원인·대응 |
|------|-----------|
| 좌측 sticky 미동작 | `grid-row: 1/3` 병합 셀이 그리드 전체 높이를 차지 → sticky 무력화 → **단일 행** + `align-self: start` |
| TOP5 vs 프로필 어긋남 | `detailGrid > * { padding: 0 }`가 `padding-top` offset을 덮음 → 공통 규칙에서 padding 제거 |
| 뒤로가기 vs 카드 정렬 | flex로 TOP5를 밀어내던 구조 → **`--person-detail-panel-offset`**(40px + gap) + 뒤로가기 `absolute` |
| 중앙 내부 스크롤 | 실수로 `detailFeedCol`에 `max-height`·`overflow-y: auto` 적용 → **중앙만 제거**, `main` 스크롤만 사용 |

#### 최종 `PersonDetailPage.module.css` 구조

```text
detailGrid (1행 3열)
├── detailLeftSticky   — padding-top offset, sticky, 내부 스크롤(패널 길 때)
│   ├── asideBackBtn   — absolute @ offset 영역 top
│   └── PersonTop5Panel
├── detailFeedCol      — padding-top offset, 스크롤 없음 (main 스크롤)
│   ├── hero
│   └── feedList …
└── detailRightPanel   — padding-top offset, sticky, 내부 스크롤(패널 길 때)
```

- **`BackToTopButton`** — `#person-detail-feed-scroll` 제거, 기본 `main[data-scroll-root]` 사용.
- **900px 이하** — offset·sticky 해제, 1열 스택.

---

## 파일 맵 (주요)

| 영역 | 파일 |
|------|------|
| 공통 그리드 | `src/pages/personPageLayout.module.css` |
| 인물 상세 | `src/pages/PersonDetailPage.tsx`, `.module.css` |
| 인물 목록 | `src/pages/PersonTrackerPage.tsx` |
| 비동기 | `src/hooks/useAsyncData.ts`, `usePerson*.ts` |
| 검색 라우팅 | `src/lib/resolveSearchNewsRoute.ts` |
| 검색 모달 | `src/components/common/TopNavSearchModal.tsx`, `.module.css` |

---

## QA 체크리스트

- [ ] 인물 목록/상세: 오늘↔7일 토글 시 **전체 스켈레톤 없이** 해당 패널만 흐림 처리
- [ ] 인물 상세: TOP5·프로필·연관 종목 **카드 상단** 가로 정렬, 뒤로가기는 그 위 offset 영역
- [ ] 인물 상세: 스크롤 시 좌·우 패널 sticky, **중앙만 페이지 스크롤** (중앙 열 안에 스크롤바 없음)
- [ ] 검색: 종목 1건 검색 후 뉴스 클릭 → 해당 종목 상세 `?newsId=`
- [ ] 검색 모달: Enter·화살표, 목록 끝 순환 없음, 탭이 스크롤에 밀리지 않음

---

## Notes

- `images/` 등 로컬 스크린샷 폴더는 커밋 대상 아님.
- 인증·세션·검색 모달 서피스 등 **5/21 changelog**와 병행 참고.
