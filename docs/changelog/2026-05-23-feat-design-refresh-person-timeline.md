# Change Log — 2026-05-23 · feat/design-refresh (인물 타임라인·스크롤·맨 위로)

브랜치 `feat/design-refresh`에서 진행한 **인물 트래커 댓글형 타임라인**, **인물 상세 프로필·발언 피드**, **타임라인 축(세로/가로)**, **전역 스크롤·맨 위로 FAB** 작업 기록입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-23 |
| 선행 문서 | [인물 3열·검색 UX (5/22)](./2026-05-22-feat-design-refresh-person-pages.md) · [인터랙티브 서피스](../design/interactive-surfaces.md) · [종목 상세 맨 위로 FAB (5/21)](./2026-05-21-feat-design-refresh-stock-detail.md) |

### 프론트 커밋 (`feat/design-refresh`, 2026-05-23 전후)

| 해시 | 요약 |
|------|------|
| `3315951` | 인물 트래커 발언 타임라인 댓글형 레이아웃 |
| `f65e946` | 트래커 발언 클릭·호버(이름·본문 primary) |
| `57a88d8` | `interactive-surfaces.md` · 워치리스트 `rowRing` |
| `59c0586` | 언급량 급등 TOP10·인물 사이드 패널 `ringRow` |
| `9bfa228` | 인물 상세 프로필 헤더·발언 `detailFeed` 분리 |
| `2741cbf` | 상세 세로축(아바타 중앙)·트래커는 세로선만 |
| `d18a64c` | 상세 가로 스텁을 `metaRow` 중앙 정렬·중앙 내부 스크롤 제거 |
| `ac47f3b` | 맨 위로 버튼 종목 상세처럼 우측 하단 `fixed` |
| `82cc87c` | 인물 트래커 → 상세 `statementId` 스크롤·초록 강조 (아래 §) |
| _(연계 5/26)_ | [종목 타임라인·API·네비](./2026-05-26-feat-design-refresh-stock-person-integration.md) |

## 요약

1. **트래커 (`/person`)** — 아바타(md) 중앙을 관통하는 **세로축만** (`feedCol::before`). 가로 스텁(`--`) 없음. 발언 행은 링크·호버 시 이름·본문 primary.
2. **상세 (`/person/:id`)** — 프로필(lg 아바타·이름·직함·오늘 언급) + 발언 목록. 세로축은 `profileTimeline::before`로 아바타 중앙에서 이어짐. 각 발언의 **`10시간 전`·감성 행(`metaRow`) 중앙**에 가로 스텁(`metaRow::before`).
3. **스크롤** — 트래커와 동일하게 **`main[data-scroll-root]` 전역 스크롤**만 사용(중앙 열 `max-height`·`overflow-y` 제거). 무한 스크롤·맨 위로도 `main` 기준.
4. **맨 위로** — 피드 하단 인라인 버튼 제거 → 종목 상세와 동일한 **`placement="fixed"` `tooltipSide="left"`**, 페이지 `padding-bottom: var(--layout-back-to-top-reserve)`.
5. **사이드 패널** — TOP5·연관 종목·버즈 TOP10에 [링 호버 패턴](../design/interactive-surfaces.md) 적용(메인 타임라인 호버는 별도).
6. **발언 포커스 (`?statementId=`)** — 검색·트래커·종목 상세 사이드바에서 진입 시 해당 발언 **초록 본문** + **`main` 스크롤 이동**. 트래커에서 상세로 갈 때도 동일.

---

## 2026-05-24 · 발언 포커스 (`statementId`)

### 흐름

```text
[진입 경로]
  TopNavSearchModal  ─┐
  PersonTrackerPage  ─┼─► /person/:personId?statementId={id}
  StockDetailContent ─┘
                              │
                              ▼
                    usePersonStatementFocus
                    ├── URL에서 statementId 읽기
                    ├── 목록에 없으면 onLoadMore 반복(최대 12회)
                    ├── #person-statement-{id} 로 main 스크롤
                    └── isStatementFocused → PersonStatementCard highlighted
```

### Changed

| 파일 | 내용 |
|------|------|
| `src/lib/buildPersonRoute.ts` | `buildPersonDetailPath(personId, { statementId })` |
| `src/hooks/usePersonStatementFocus.ts` | `data-scroll-root` 기준 스크롤·재시도·자동 `loadMore`·바깥 클릭 시 쿼리 제거 |
| `src/components/person/PersonStatementCard.tsx` | 트래커 `variant="full"` 링에 `statementId` 쿼리 부착 |
| `src/pages/PersonDetailPage.tsx` | 훅에 `feedInitialLoading`·`hasMore`·`loadMore` 전달 |
| `src/pages/PersonTrackerPage.tsx` | 동일(트래커 내 `?statementId=` 포커스도 지원) |

### DOM·스타일

- 각 발언 `li`에 `id="person-statement-{mention.id}"` (`mention.id` = API `statementId` 문자열).
- 상세 `variant="detailFeed"` + `highlighted` → `.detailFeedFocused` → `.statementText` 초록 (`--color-sentiment-positive` 계열).
- 트래커 `variant="full"` 호버는 **primary(파랑)** 유지; 초록은 **도착 페이지**에서만.
- `personPageLayout.module.css` `.timelineItem` — `scroll-margin-block: 6rem` (고정 헤더 여백).

### QA (추가)

- [ ] **트래커**: 발언 클릭 → `/person/:id?statementId=…` · 상세에서 해당 카드가 보이도록 스크롤 · 본문 초록
- [ ] **검색**: 발언 행 클릭 → 동일 동작
- [ ] **종목 상세**: 인물 타임라인 클릭 → 동일 동작
- [ ] 첫 페이지에 없는 오래된 발언도 자동 추가 로드 후 스크롤(있을 때)
- [ ] 포커스 카드 밖 클릭 시 `statementId` 쿼리 제거·초록 해제

---

## Changed

### 인물 트래커 타임라인 (`3315951`, `f65e946`, `2741cbf`)

#### `PersonStatementCard` · `personPageLayout.module.css`

| 요소 | 동작 |
|------|------|
| `variant="full"` | 2열 그리드(아바타 rail + 본문), `/person/:id` 링크 |
| 호버·포커스 | `.name`, `.statementText` → `var(--color-primary)` |
| `.feedCol::before` | `left: 1.25rem`(md 아바타 중심), `top`~`bottom` 세로선 |
| `.timelineItem` | 가로 `::before` 없음 |

#### `PersonTrackerPage`

- `useInfiniteScroll` — 기본 `main[data-scroll-root]` (별도 `scrollRootSelector` 없음).

---

### 인물 상세 (`9bfa228`, `2741cbf`, `d18a64c`)

#### `PersonDetailPage.tsx` · `.module.css`

- 피드 기간: **`today` 고정** (`PERSON_DETAIL_FEED_RANGE`), 히어로에 오늘/7일 토글 없음.
- **`profileTimeline`**: `profileHeader` + `feedBody`(발언 목록·센티널).
- **`detailFeedCol`**: `max-height`·flex 내부 스크롤 제거 → 페이지와 함께 스크롤.
- **`profileTimeline::before`**: lg 아바타(`3.5rem`) 중앙 `1.75rem`에서 발언 끝까지 세로축.

#### `PersonStatementCard` · `variant="detailFeed"`

```text
detailFeed (padding-left = rail + stub + gap)
├── metaRow          ← metaRow::before: 세로축 → 시간 행 중앙 가로 스텁
│   ├── metaTime     ("10시간 전")
│   └── sentInline
└── statement / statementText
```

- `li.timelineItemDetail`의 `::before` 가로 스텁 제거 → **`metaRow::before`**로 시간·감성 행에 정렬.

---

### 맨 위로 FAB (`ac47f3b`)

#### `PersonTrackerPage` · `PersonDetailPage`

```tsx
{feed ? <BackToTopButton placement="fixed" tooltipSide="left" /> : null}
```

- 종목 상세 [`StockDetailContent`](../components/stock/StockDetailContent.tsx)와 동일 API.
- `BackToTopButton.module.css` `.wrapFixed` — 본문 우측 하단 고정(960px 이하 `50vw`).

---

### 인터랙티브 서피스 (`57a88d8`, `59c0586`)

| 패턴 | 모듈 | 적용 |
|------|------|------|
| `ringRow` | `interactiveListRow.module.css` | `PersonTop5Panel`, `PersonFrequentStocksPanel`, `BuzzSurgeTop3` |
| `rowRing` | `interactiveTableRow.module.css` | `BuzzSurgeTop10Table`, `DashboardWatchlistTable` |

- 인물 **메인 타임라인**은 링 테두리 대신 **텍스트 primary 호버** 유지.

---

## 파일 맵 (주요)

| 영역 | 파일 |
|------|------|
| 공통 그리드·트래커 축 | `src/pages/personPageLayout.module.css` |
| 인물 상세 | `src/pages/PersonDetailPage.tsx`, `.module.css` |
| 인물 목록 | `src/pages/PersonTrackerPage.tsx`, `.module.css` |
| 발언 카드 | `src/components/person/PersonStatementCard.tsx`, `.module.css` |
| 맨 위로 | `src/components/common/BackToTopButton.tsx`, `.module.css` |
| 무한 스크롤 | `src/hooks/useInfiniteScroll.ts` |
| 발언 포커스 | `src/hooks/usePersonStatementFocus.ts`, `src/lib/buildPersonRoute.ts` |
| 인터랙션 문서 | `docs/design/interactive-surfaces.md` |

---

## QA 체크리스트

- [ ] **트래커**: 아바타 중앙 세로선만 보이고, 발언마다 가로 `--` 없음
- [ ] **트래커**: 발언 호버 시 이름·본문이 primary, 클릭 시 상세 이동
- [ ] **상세**: 프로필 아래 발언의 가로선이 `N시간 전`·`N일 전` 텍스트 높이와 맞음
- [ ] **상세·트래커**: 스크롤바가 **페이지(main)** 에만 있고 중앙 열 안에는 없음
- [ ] **상세·트래커**: 스크롤 후 우측 하단 맨 위로 FAB, 클릭 시 페이지 최상단
- [ ] **사이드**: TOP5·연관 종목·버즈 TOP10 행 호버 시 primary 링(메인 타임라인과 혼동 없음)

---

## Notes

- `9bfa228` 시점의 **중앙 열 내부 스크롤**은 `d18a64c`에서 제거됨 — 최종 UX는 [5/22 인물 페이지 changelog](./2026-05-22-feat-design-refresh-person-pages.md)의 “main만 스크롤”과 동일.
- `images/` 로컬 스크린샷은 커밋 대상 아님.
