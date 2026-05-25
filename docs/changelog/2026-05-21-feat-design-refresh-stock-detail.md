# Change Log — 2026-05-21 · feat/design-refresh (종목 상세)

브랜치 `feat/design-refresh`에서 진행한 **종목 상세 우측 패널(연관 종목·인물 발언 타임라인)·맨 위로 FAB·OpenAPI 주가** 작업 기록입니다.  
검색 모달 델타는 [2026-05-21-feat-design-refresh-search-modal.md](./2026-05-21-feat-design-refresh-search-modal.md), 초기 토큰은 [2026-05-15-feat-design-tokens.md](./2026-05-15-feat-design-tokens.md)를 참고합니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-21 |
| 참고 UI | Bloomberg Latest(타임라인), CoinMarketCap(맨 위로 FAB) |
| 선행 작업 | 검색 유입 뉴스 `?newsId=` 강조 — [search-modal changelog](./2026-05-21-feat-design-refresh-search-modal.md#종목-상세--검색-유입-뉴스-5b98431) |

### 프론트 커밋 (`feat/design-refresh`)

| 해시 | 요약 |
|------|------|
| `cee8610` | feat: 종목 상세 API 주가(`currentPrice`·`changeRate`) 매핑 |
| `32c5122` | feat: 종목 상세 인물 발언 타임라인 및 맨 위로 버튼 UX 개선 |
| `c20e2d0` | fix: 인물 발언 카드 내 CMC 스타일 맨 위로 버튼 배치·색상 |
| `1108aac` | fix: 인물 발언 타임라인 높이 28rem 토큰 고정 및 JS 높이 계산 제거 |
| `fc5ab81` | fix: 종목 상세 맨 위로 FAB·연관 종목 UI 조정 |
| `f94ee82` | fix: 큰 화면 본문 너비·좌우 여백 조정 및 종목 상세 changelog |
| `1851ed0` | style: 종목 상세 인물 발언 타임라인 높이·타이포 조정 |
| _(이후 5/26)_ | [인물 타임라인 UI·API·포커스·네비](./2026-05-26-feat-design-refresh-stock-person-integration.md) (`ead8ffd`~`018d509`) |

## 요약

1. **주가** — `GET /api/v1/stocks/{code}`의 `currentPrice`·`changeRate`를 헤더 가격 UI에 매핑.
2. **인물 발언 타임라인** — `GET /api/v1/persons/mentions/cursor`로 연관 발언 수집(최대 8건 UI), Bloomberg Latest 스타일(좌측 상대 시각·우측 요약, 1시간 이내 빨간 시각).
3. **레이아웃** — 하단 그리드 `뉴스 | 우측 스택` 비율을 상단 차트와 동일하게, 타임라인 카드 높이 **토큰 고정**(28rem → **32rem**).
4. **맨 위로** — 카드 내부 FAB 시행착오 후 **화면 우하단 `fixed` + portal**, FAB 면색 **밝은 회색** 토큰.
5. **연관 종목** — API 응답은 유지, UI만 **최대 3건** (`RELATED_STOCKS_DISPLAY_MAX`).
6. **본문 셸** — 고정 `83rem` 제거, **main 가용 너비** + 좌우 패딩 `clamp(24px, 2.5vw, 48px)` (큰 모니터 대응).

---

## Changed

### OpenAPI 주가 (`cee8610`)

#### `stockApi.ts` · `stockMapper.ts`

- `StockInfoResponse`에 `currentPrice?`, `changeRate?` 반영
- `mapStockPriceInfo(currentPrice, changeRate)` — `changeRate`를 등락률(%)로 보고 현재가·변동액·변동률 `StockPriceInfo` 생성
- `mapStockDetailPage`에서 `stock.price`에 위 매핑 적용

---

### 인물 발언 타임라인 (`32c5122`, `1108aac`)

#### API · 클라이언트

| API | 용도 |
|-----|------|
| ~~`GET /api/v1/persons/mentions/cursor`~~ | ~~`fetchPersonStatementsForStockDetail`~~ (5/26부터 **deprecated**) |
| `GET /api/v1/stocks/{code}/related-person-statements` | 종목 연관 인물 발언 **5건** (`fetchStockRelatedPersonStatements`) — [5/26 changelog](./2026-05-26-feat-design-refresh-stock-person-integration.md) |
| `GET /api/v1/stocks/{code}/related` | 연관 종목 (기존) |

- (구) `personClient.fetchPersonStatementsForStockDetail` — 커서 다회·최대 8건
- (현) `stockClient.fetchStockRelatedPersonStatements` — OpenAPI `getRelatedPersonStatements`, `mapStockPeopleTimeline` limit 5

#### 유틸 (신규·확장)

| 경로 | 역할 |
|------|------|
| `src/lib/formatRelativeTime.ts` | `formatPersonTimelineTime` — 1시간 이내 `isFresh` → 빨간 상대 시각 라벨 |
| `src/lib/truncateText.ts` | 사이드바 요약 **140자** 컷 (`STOCK_PERSON_SUMMARY_MAX_LEN`) |

#### UI — `StockDetailContent`

- 우측 `rightStack`: **연관 종목** + **최신 인물 발언 타임라인**
- 타임라인 행: 좌 `relativeLabel`(fresh 시 danger), 우 `summary`·`sourceName`·감성 점수
- `.bottomGrid`: `minmax(0, 1fr) | minmax(20rem, 24rem)` — 상단 차트 그리드와 동일 비율
- `.relatedPanel` — 패딩·행 간격 축소(여백 절반)

#### 높이 (`1108aac`)

- `useStockPeopleTimelineScrollMax` **삭제** — JS `--people-timeline-max-height` 계산이 카드를 비우거나 1건만 보이게 하던 문제
- `tokens.css`: `--layout-stock-people-panel-height` (**28rem** → **32rem**, `1851ed0`)
- `.peoplePanel`: `flex: 0 0 auto`, 고정 height/min/max, 리스트만 `overflow-y: auto`

#### 타이포·행 간격 (`1851ed0`)

| 요소 | 이전 | 이후 |
|------|------|------|
| 상대 시각 | `--font-size-sm` (12px) | `--font-size-base` (13px) |
| 발언 요약 | `--font-size-base` (13px) | `--font-size-lg` (14px) |
| 메타(이름·직함·출처) | `--font-size-sm` | `--font-size-base` |
| 항목 패딩 | `--space-2` | `--space-3` |
| 행 그리드 | `3.75rem \| 1fr`, gap `--space-3` | `4rem \| 1fr`, gap `--space-4` |

---

### 맨 위로 FAB (`32c5122` → `c20e2d0` → `fc5ab81`)

#### 변천

1. **초기** — Layout `main` 스크롤 기준, 타임라인과 겹침
2. **`c20e2d0`** — 타임라인 **카드 내부** 우하단 `placement="inline"` (CMC 톤 FAB 토큰 도입)
3. **`fc5ab81`** — 카드 밖 **화면 우하단** `placement="fixed"` + `createPortal(document.body)` (CMC와 동일 개념)

#### `tokens.css` — FAB

| 토큰 | 다크 (최종 `fc5ab81`) | 비고 |
|------|----------------------|------|
| `--color-fab-surface` | `#5a6578` | 이전 `#323946`보다 밝은 회색 |
| `--color-fab-on-surface` | `#f2f6fa` | |
| `--color-fab-surface-hover` | `#6b778c` | |
| `--layout-back-to-top-size` | `2.75rem` | |
| `--layout-back-to-top-bottom` | `var(--space-6)` | |

- `BackToTopButton.module.css` `.wrapFixed` — 사이드바·메인 패딩·`bottomGrid` 우측 컬럼 기준 `left` 계산
- `tooltipSide="left"` — 좁은 우측 컬럼 대응
- `stockDetailMarker` → `data-stock-back-to-top` (향후 레이아웃 측정용, 선택)

#### 제거 (`fc5ab81`)

- `.peoplePanelFabSlot`, `.peoplePanelFabBtn`, 카드용 `padding-bottom`(FAB reserve)

---

### 연관 종목 표시 상한 (`fc5ab81`)

- `StockDetailContent.tsx`: `RELATED_STOCKS_DISPLAY_MAX = 3`
- 렌더: `relatedStocks.slice(0, 3)` — **프론트 일시 제한**, API·매퍼는 변경 없음

---

### 본문 셸 · 큰 모니터 (`f94ee82`)

#### `tokens.css`

| 토큰 | 이전 | 이후 |
|------|------|------|
| `--layout-page-max` | `83rem` (1328px) 고정 | `min(--layout-page-wide-cap, 100%)` |
| `--layout-page-wide-cap` | — | `120rem` (초광폭 상한) |
| `--layout-main-pad-inline` | — | `clamp(--space-6, 2.5vw, --space-12)` (24px~48px) |

#### `Layout.module.css` · `BackToTopButton.module.css`

- `.main` — `--layout-page-max`를 main 가용 너비 기준으로 재정의, `--main-pad-inline`에 `--layout-main-pad-inline` 연동
- 맨 위로 `fixed` — 기본 레이아웃(사이드바 없음)에 맞춰 `--page-w`·`left` 계산 단순화

> 넓은 뷰포트에서 1328px 박스 양옆 dead space가 커지던 문제 완화. 콘텐츠는 main을 채우고, 좌우만 뷰포트에 비례해 여백 확보.

---

## 주요 파일

| 영역 | 경로 |
|------|------|
| 종목 상세 UI | `src/components/stock/StockDetailContent.tsx` · `.module.css` |
| 맨 위로 | `src/components/common/BackToTopButton.tsx` · `.module.css` |
| 주가·타임라인 매핑 | `src/data/mappers/stockMapper.ts` |
| 발언 fetch | `src/data/clients/personClient.ts` · `stockClient.ts` |
| 타입 | `src/data/types/stockApi.ts` · `stock.ts` |
| 토큰·레이아웃 | `src/styles/tokens.css` · `Layout.module.css` |
| 시간·텍스트 | `src/lib/formatRelativeTime.ts` · `truncateText.ts` |

---

## 의도

1. **실시간 주가** — OpenAPI 필드를 헤더에 반영해 목업·하드코드 의존 축소.
2. **Bloomberg Latest식 타임라인** — 종목 맥락의 인물 발언을 한눈에, fresh 구간은 시각 강조.
3. **안정적인 카드 높이** — JS 동적 max-height 대신 토큰 고정(현재 **32rem**)으로 예측 가능한 스크롤 영역.
4. **FAB는 콘텐츠와 분리** — 타임라인 카드 안 버튼은 발언 텍스트와 겹쳐 보이므로 **뷰포트 fixed**로 이동.
5. **연관 종목 밀도** — 우측 패널이 길어지지 않도록 당분간 3건만 노출.
6. **반응형 셸** — 큰 모니터에서 본문 폭 활용 + 좌우 `clamp` 패딩으로 답답함 완화.

---

## 확인

- [ ] 종목 상세 헤더 — `currentPrice`·`changeRate` 표시·등락 색
- [ ] 우측 타임라인 — 8건 이하, 1시간 이내 시각 빨간색, 요약 140자 말줄임
- [ ] 타임라인 카드 높이 **32rem**, 내부만 스크롤·폰트 한 단계 상향
- [ ] 1920px+ 뷰포트 — 본문이 main을 채우고 좌우 패딩이 24px 이상
- [ ] 스크롤 200px 이상 — 우하단 **밝은 회색** 원형 맨 위로, 타임라인 카드 **밖**
- [ ] 연관 종목 — **3개**만 표시
- [ ] 검색 `?newsId=` 유입 시 제목 강조(기존)와 충돌 없음
- [ ] `npm run lint` · `npx tsc -b`

## Notes

- 연관 종목 3건 제한·타임라인 8건·요약 140자는 **프론트 상수** — API `limit` 정리 시 상수 제거·서버와 맞출 예정.
- 삭제된 `useStockPeopleTimelineScrollMax.ts`는 재도입하지 않는 것을 권장(레이아웃 버그 재발).
