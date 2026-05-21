# Change Log — 2026-05-21 · feat/design-refresh (통합 검색 모달)

브랜치 `feat/design-refresh`에서 진행한 **통합 검색 모달·검색 API 연동·종목 상세 뉴스 포커스** 작업 기록입니다.  
`2026-05-15-feat-design-tokens.md`의 초기 토큰 정의는 **변경하지 않고**, 본 문서에만 델타를 남깁니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 브랜치 (BE, 연동) | `feat31/search-integration` — fallback 감성 점수 `ab5f5c7` |
| 작업일 | 2026-05-21 |
| 참고 UI | CoinMarketCap 검색 모달 (넓은 패널 + 모달/카드 서피스 분리) |
| 스냅샷 Before | [snapshots/2026-05-21/](../snapshots/2026-05-21/) · [ui-pre-design-refresh.md](../snapshots/2026-05-21/ui-pre-design-refresh.md) |

### 프론트 커밋 (`feat/design-refresh`)

| 해시 | 요약 |
|------|------|
| `8059b1f` | docs: 디자인 리프레시 이전 UI 스냅샷(2026-05-21) 보관 |
| `de9fdb2` | feat: 검색 모달 서피스·업종 fallback·행 분리 UI |
| `537608d` | feat: 검색 API news 필드 연동 및 모달 UX 개선 |
| `98ab68a` | fix: 검색 모달 상단 41px·하단 82px 여백 및 오버레이 레이아웃 |
| `114dd55` | feat: 검색 모달 P 키 포커스 및 SearchNewsItem 라우팅 메타 |
| `f582b22` | feat: 검색 모달 인물·종목 결과 UI 정리 |
| `5b98431` | feat: 검색 뉴스·종목 상세 라우팅 및 선택 뉴스 제목 강조 |

## 요약

1. **모달 서피스·레이아웃** — CMC 참고 너비·셸/inset 색, 상단 41px·하단 82px 여백, `Modal` 오버레이 커스터마이즈.
2. **검색 API** — `SearchResponse.news`·`SearchNewsItem` 라우팅 메타, fallback 업종·인물·뉴스, 인물 `relatedNews` 제거.
3. **결과 UI** — 종목·인물·발언·뉴스를 **행 카드**로 분리, 탭에 **건수** 표시, 도메인(종목/인물) 분기.
4. **내비게이션** — 뉴스/종목명 클릭 → 종목 상세(`?newsId=`), 검색 진입 뉴스 **제목만** 초록 강조.
5. **단축키** — `/` 모달 열기(기존), 모달 안 `P` 검색창 포커스(한글 IME `KeyP`).

---

## Changed

### 문서·스냅샷 (`8059b1f`)

- `docs/snapshots/2026-05-21/` — 홈·종목·검색 모달 등 PNG 8장 + `ui-pre-design-refresh.md`
- 리프레시 **Before** 기준으로 이후 UI diff 추적용

### 디자인 토큰 · 모달 셸 (`de9fdb2`, `98ab68a`)

#### `src/styles/tokens.css`

| 토큰 | 2026-05-15 (보존) | 2026-05-21 |
|------|-------------------|------------|
| `--layout-modal-search` | `45rem` (720px) | **`52rem` (832px)** |
| `--layout-search-modal-top` | — | **`41px`** |
| `--layout-search-modal-bottom` | — | **`82px`** |
| `--color-bg-modal` (dark) | `#0b1018` | **`#212630`** |
| `--color-bg-modal` (light) | `#eef2f7` | **`#eceff4`** |
| `--color-bg-modal-inset` (dark) | — | **`#282e3a`** |
| `--color-bg-modal-inset` (light) | — | **`#f4f6fa`** |

> 셸(`--color-bg-modal`) / inset(`--color-bg-modal-inset`) 2단. 페이지 `--color-bg-card`는 모달 안에 쓰지 않음.

#### `Modal` · `TopNavSearchModal`

- `contentClassOnly` — 기본 `.content`의 `margin: auto`·`max-height` 미적용 (검색 모달이 세로 중앙에 붙던 문제 해결)
- `overlayClassName` → `.searchOverlay`에 `padding: top 41px / bottom 82px`
- `DevSearchModal.module.css` — 동일 서피스·너비·그림자 정렬

---

### 검색 API · 타입 · 매퍼 (`537608d`, `114dd55`)

#### OpenAPI / `searchApi.ts`

- **`SearchResponse.news`** — 검색어 매칭 시 통합 뉴스 최대 10건 (`SearchNewsItemResponse`)
- **`SearchNewsItem`** — `sourceType` (`stock` \| `person` \| `mixed` \| `unknown`), `primaryStockCode`, `stocks[]`, `persons[]`, `sentiment`·`sentimentScore`
- **`PersonSearchItem`** — **`relatedNews` 제거**, `relatedStatements`만 유지 (인물=발언 중심)
- **`FallbackSections.latestNews`** — `SearchNewsItem` 배열

#### `searchMapper.ts` · `search.ts`

- `mapSearchNewsItem` / `mapSearchNewsPreviews` — 통합·fallback 뉴스 전용 매핑
- `SEARCH_NEWS_MAX = 10` (`src/data/constants/search.ts`)
- `UnifiedSearchResult.news` — flatten 제거, 공통 `news` 배열만 UI에 사용
- `groupStocksBySector` — `FallbackStockItem`·검색 종목 업종 헤더 (`src/lib/groupStocksBySector.ts`)

#### `resolveSearchNewsRoute.ts` (신규)

- `resolveSearchNewsStockCode` / `buildStockDetailPath(code, newsId?)`
- `resolveSearchNewsRoute` — 뉴스 행 → `/stock/:code?newsId=:id` (종목 우선, 인물-only → `/person`)
- `resolveSearchNewsStockRoute` — 종목명만 → `/stock/:code`
- `formatSearchNewsStockLabel` — 카드 좌상단 대표 종목명

---

### 통합 검색 모달 UX (`TopNavSearchModal`)

#### 레이아웃·스타일

- 입력·결과 패널: `--color-bg-modal-inset`, 행 hover **파란 테두리** (`searchRow` / `newsRowCard`)
- `rowList` + 칸 단위 카드 (종목·인물·발언·뉴스 한 덩어리 패널 제거)

#### 도메인 · 탭

| 모드 | 탭 | 비고 |
|------|-----|------|
| 검색어 + 종목·인물 동시 | **종목 (n)** / **인물 (n)** | 상단 도메인 탭 |
| 종목 도메인 | 전체 · **종목 (n)** · **뉴스 (n)** | |
| 인물 도메인 | 전체 · **인물 (n)** · **발언 (n)** | **뉴스 탭 없음** |
| 빈 검색 (fallback) | 전체 · 종목 · 인물 · 뉴스 | `fallbackSections` |

#### 종목 결과

- 업종별 `ResultSection` + `StockSearchRow` (관심추가·상세보기)
- fallback 인물: `searchRowWithStat` — **언급 수** 별도 컬럼

#### 인물 · 발언

- 인물 카드와 발언 **섹션 분리** (`PersonStatementSections`)
- 발언 메타: **날짜·시간만** (언론사명 제거)
- 발언 행: `searchRow` 카드 + **발언 보기**
- 인물 1명이면 `발언` 단일 섹션, 여러 명이면 **인물명별** 발언 섹션

#### 뉴스 행

- 좌상단 **종목명** (`text-muted`, 클릭 시 종목 상세만)
- 제목 → 메타 `출처 · 날짜 · **감성점수**`
- 카드 클릭 → 종목 상세 + `newsId` 쿼리
- `newsId`·라우트 없으면 `originalLink` 외부 링크

#### 푸터 · 단축키

- `p 검색` · `관심목록 즉시 반영` · `ESC 모달 닫기` (텍스트만, 버튼 UI 없음)
- **`P` / `KeyP`** — 모달 열림 시 검색 input 포커스 (한글 IME 대응, input 포커스 중에는 `p` 입력 허용)
- **`/`** — 모달 열기 (`TopNavActions`, 기존)

#### 에러 · 로딩

- 검색 실패 시 모달 **국소** 에러 (`seed` error / fetch error), 전체 페이지 에러 아님

---

### 종목 상세 — 검색 유입 뉴스 (`5b98431`)

#### `StockDetailPage` · `StockDetailContent`

- `?newsId=` 쿼리 읽기 → 해당 뉴스로 **스크롤** + 목록 **제목만** 초록 (`--color-success`)
- 다른 영역 `pointerdown` → `newsId` 제거, 강조 해제
- 진입 시 뉴스 감성 필터 **전체**로 맞춤 (필터에 가려지지 않게)

#### `StockNewsListItem`

- `id="stock-news-{id}"` — 스크롤 타깃
- 제목 내 키워드 `mark` — **초록 하이라이트 제거** (본문색 상속)

---

### 백엔드 연동 (별도 repo, 동일 작업일)

| 이슈 | 원인 | 수정 (`ab5f5c7`) |
|------|------|------------------|
| fallback **최신 뉴스** 감성 점수 전부 `0` | `SearchService.loadFallbackSections()`에서 `0`, `"neutral"` 하드코딩 | `findLatestAnalyzedNews`에서 종목·인물 맵 `sentiment_score` 조회 |

API 서버 재시작 후 빈 검색 → fallback 뉴스 점수 확인.

---

## 주요 파일

| 영역 | 경로 |
|------|------|
| 모달 UI | `src/components/common/TopNavSearchModal.tsx` · `.module.css` |
| 모달 공통 | `src/components/ui/Modal.tsx` |
| 라우팅 | `src/lib/resolveSearchNewsRoute.ts` |
| API 타입 | `src/data/types/searchApi.ts` · `search.ts` |
| 매퍼·목 | `src/data/mappers/searchMapper.ts` · `mocks/search.mock.ts` |
| 상수 | `src/data/constants/search.ts` |
| 업종 그룹 | `src/lib/groupStocksBySector.ts` |
| 종목 상세 | `src/pages/StockDetailPage.tsx` · `StockDetailContent.tsx` · `StockNewsListItem.*` |
| 토큰 | `src/styles/tokens.css` |

---

## 의도

1. **CMC식 검색 패널** — 넓은 모달, 셸/inset 분리, 카테고리(업종)·칸별 hover.
2. **역할 분리** — 종목=뉴스·인물=발언, 통합 `news`는 공통 섹션·종목 탭.
3. **라우팅 메타** — 뉴스 클릭 시 대표 종목·기사까지 앱 내 이동.
4. **가벼운 포커스** — 검색에서 온 기사는 제목만 초록, 클릭 시 해제.
5. **문서** — 5/15 토큰 changelog 보존, 본 파일에 리프레시 델타만 누적.

---

## 확인

- [ ] `/` · 상단 검색 → 모달 너비·여백·inset 대비
- [ ] 빈 검색 fallback — 업종별 종목, 화제 인물(언급 수), 최신 뉴스(**감성 점수 0 아님**, BE 반영 후)
- [ ] `삼성` 등 — 종목 (n)·뉴스 (n), 뉴스 카드 종목명/메타/점수
- [ ] `젠슨` 등 — 인물 (n)·발언 (n), 뉴스 탭 없음
- [ ] 뉴스 클릭 → `/stock/:code?newsId=` · 제목 초록 · 외부 클릭 시 해제
- [ ] 종목명 클릭 → `/stock/:code` only
- [ ] 모달 안 `P` (한/영) → 검색창 포커스
- [ ] 라이트/다크 테마
- [ ] `npm run lint` · `npx tsc -b`
