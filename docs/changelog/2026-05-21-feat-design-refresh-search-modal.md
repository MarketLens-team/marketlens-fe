# Change Log — 2026-05-21 · feat/design-refresh (통합 검색 모달)

브랜치 `feat/design-refresh`에서 진행한 **통합 검색 모달 레이아웃·서피스 토큰** 조정 기록입니다.  
`2026-05-15-feat-design-tokens.md`의 초기 토큰 정의는 **변경하지 않고**, 본 문서에만 델타를 남깁니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-21 |
| 참고 UI | CoinMarketCap 검색 모달 (넓은 패널 + 모달/카드 서피스 분리) |
| 스냅샷 Before | [snapshots/2026-05-21/04-search-modal.png](../snapshots/2026-05-21/04-search-modal.png) |

## 요약

통합 검색 모달을 **조금 더 넓게** 열고, 모달 배경(`--color-bg-modal`)을 **카드(`--color-bg-card`)·입력(`--color-bg-elevated`)과 시각적으로 구분**한다. 모달 셸에 그림자·강한 테두리를 두어 오버레이 위에서 떠 보이게 한다.

## Changed

### 통합 검색 UX

- **검색 응답** — OpenAPI `SearchResponse.news` (최대 10건) 연동. 종목·인물 중첩 `relatedNews` flatten 제거, 뉴스 탭은 공통 `news` 배열만 사용. 발언·fallback 뉴스도 `SEARCH_NEWS_MAX=10` 슬라이스.
- **Fallback** — OpenAPI `FallbackStockItem`의 `sectorCode`·`sectorName`·`market` 매핑 후 `stockSectors`로 업종별 섹션 표시 (CMC 카테고리 헤더 패턴).
- **검색 결과 종목** — 동일하게 업종별 `ResultSection` 분리.
- **행 UI** — 종목·인물·**뉴스**를 칸 단위(`rowList` + `searchRow` / `newsRowCard`)로 분리, hover 시 **파란 테두리** (`--color-primary`).
- `src/lib/groupStocksBySector.ts` — fallback·검색 공용 그룹 유틸.

### `src/styles/tokens.css`

| 토큰 | 2026-05-15 (보존) | 2026-05-21 (본 작업) |
|------|-------------------|----------------------|
| `--layout-modal-search` | `45rem` (720px) | **`52rem` (832px)** |
| `--color-bg-modal` (dark) | `#0b1018` | **`#212630`** (중립 회색 셸) |
| `--color-bg-modal` (light) | `#eef2f7` | **`#eceff4`** |
| `--color-bg-modal-inset` (dark) | — | **`#282e3a`** (모달 안 필드·패널) |
| `--color-bg-modal-inset` (light) | — | **`#f4f6fa`** |

> CMC식 고대비가 아님. **셸(`--color-bg-modal`) / inset(`--color-bg-modal-inset`)** 2단으로 모달 안만 조화. 페이지 `--color-bg-card`는 그대로.

### `TopNavSearchModal.module.css`

- `dialogContent`: 좌우 여백 `space-8`, `border-strong`, box-shadow
- `dialogBody`: 가로 패딩 `space-6`
- `.input`·`.resultPanel`: `--color-bg-modal-inset`, hover/버튼도 inset 기준 mix
- `--layout-search-modal-top`: `41px`, `--layout-search-modal-bottom`: `82px`

### `DevSearchModal.module.css`

- 실험용 검색 모달도 동일하게 `--color-bg-modal`·너비·그림자 정렬

## 의도

1. **너비** — CMC처럼 결과 행(종목·MCap·가격 등)을 넓게 읽을 수 있게, 720px → 832px.
2. **서피스 계층** — 셸 `#212630` → inset `#282e3a`(입력·종목/인물 패널). 네이비 `--color-bg-card`를 모달 안에 쓰지 않음.
3. **문서 분리** — 5/15 토큰 PR 기록은 역사 보존; 리프레시 델타만 본 파일에 누적.

## 확인

- `/` 또는 상단 검색 → 모달 너비·배경 대비
- 라이트/다크 테마 전환 시 모달·카드 대비 유지
- `npm run lint:css` (tokens.css는 ignore 구간이지만 Module은 규칙 적용)
