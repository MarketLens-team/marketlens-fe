# 인터랙티브 서피스 (호버 · 포커스)

**이 문서가 다루는 것:** 클릭·키보드로 선택 가능한 **행·카드·링크**의 시각 피드백 규칙.  
**다루지 않는 것:** 글자 크기·굵기(→ `tokens.css` 타이포 + `typography.css`), 버튼 variant(→ `PillButton` 등 UI 컴포넌트).

| 구분 | 위치 | 역할 |
|------|------|------|
| **토큰(값)** | `src/styles/tokens.css` | `--interactive-*` 색·링 정의 |
| **패턴(규칙)** | **이 문서** (`docs/design/`) | 언제 어떤 패턴을 쓸지 |
| **구현(코드)** | `*.module.css`, 공유 모듈 | 화면별 적용 |

제품 화면 맥락은 [ui-product-overview.md](./ui-product-overview.md), 토큰 도입 이력은 [changelog/2026-05-15-feat-design-tokens.md](../changelog/2026-05-15-feat-design-tokens.md)를 본다.

---

## 1. 토큰 (`src/styles/tokens.css`)

```css
--interactive-surface-border: /* 기본(안 보이게 쓸 때는 transparent와 병행) */
--interactive-ring-hover:     /* 호버: primary 40% 링 */
--interactive-ring-focus:     /* 키보드 :focus-visible 링 */
--interactive-surface-bg-hover: /* 배경 틴트 전용(테이블 행 등) */
```

| 토큰 | 용도 |
|------|------|
| `--interactive-ring-hover` / `--interactive-ring-focus` | `border-color: primary` + `box-shadow` 링 (검색 종목 행, TOP3 리스트 등) |
| `--interactive-surface-bg-hover` | 테두리 없이 배경만 살짝 (레거시·일부 카드; 신규는 패턴별 판단) |

---

## 2. 패턴 종류

### A. **링 행** (List row · ring)

**레퍼런스:** 통합 검색 모달 `.searchRow` (`TopNavSearchModal.module.css`)

| 상태 | 스타일 |
|------|--------|
| 기본 | `border: 1px solid transparent` (또는 모달 안에서는 `--interactive-surface-border`) |
| `:hover` / `:focus-visible` | `border-color: var(--color-primary)` + `box-shadow: var(--interactive-ring-hover \| focus)` |
| 배경 | 호버 시 **틴트 없음** (검색 행 기준) |

**적용 예**

| 컴포넌트 | 파일 | 비고 |
|----------|------|------|
| 언급량 급증 TOP 3 | `BuzzSurgeTop3.module.css` `.item` | 홈 좌측 — **평소 transparent**, 호버만 링 |
| 통합 검색 종목 행 | `TopNavSearchModal.module.css` `.searchRow` | 모달 inset 배경 + 기본 border |
| TOP5·연관종목 등 | `PersonTop5Panel.module.css` 등 | 카드 리스트 — 기본 border 있음 |

**CSS 스니펫 (평소 테두리 없음)**

```css
.item {
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease;
}
.item:focus {
  outline: none;
}
@media (hover: hover) and (pointer: fine) {
  .item:hover {
    border-color: var(--color-primary);
    box-shadow: var(--interactive-ring-hover);
  }
}
.item:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--interactive-ring-focus);
}
```

---

### B. **테이블 행** (Table row · subtle fill)

**공유 모듈:** `src/components/common/interactiveTableRow.module.css`  
`composes: tableBase / rowBase` 로 테이블에 붙인다.

| 상태 | 스타일 |
|------|--------|
| 기본 | 테두리·구분선 **없음**, `td` 배경 transparent |
| `:hover` | `td` 배경 `primary 6%` mix |
| `:focus-visible` | `td` 배경 `primary 8%` mix, **링·테두리 없음** |
| `:focus` (마우스 클릭 후) | 링 없음 (`outline: none`) |

**적용 예:** `BuzzSurgeTop10Table`, `MyPageWatchlistTable`, `AdminStocksPage`

> 테이블에 행 `border-bottom` 구분선·항상 보이는 `border`를 넣지 않는다.

---

### A′. **링 테이블 행** (Table + ring, `rowRing`)

**공유 모듈:** `interactiveTableRow.module.css` — `composes: rowRing`

패턴 A와 동일하게 **평소 transparent**, 호버·`:focus-visible`만 primary 링. `<table>` 안에서 TOP3·검색 행과 같은 느낌이 필요할 때 쓴다.

| 적용 예 | 파일 |
|---------|------|
| 홈 관심종목 워치리스트 | `DashboardWatchlistTable.module.css` `.rowClickable` |

---

### C. **텍스트만** (Text-only hover)

**적용 예:** 종목 상세 관련 뉴스 `StockNewsListItem.module.css`

| 상태 | 스타일 |
|------|--------|
| 기본 / 호버 | 카드 **테두리·링·배경 틴트 없음** |
| `:hover` / `:focus-visible` | **제목(`.title`)만** `color: var(--color-primary)` |
| 검색 진입 강조 | `.linkFocusedFromSearch .title` → `var(--color-success)` |

---

### D. **예외 — GNB 상단 메뉴**

**파일:** `TopNavMenu.module.css`

- **밑줄 인디케이터**만 (활성 탭 + 호버 시 이동하는 2px 바)
- `box-shadow` 링·항목 테두리 **사용 안 함**
- `:focus` / `:focus-visible` → `outline: none`, 색만 변경

**전역 포커스 제외:** `src/styles/global.css`

```css
nav[aria-label='상단 메뉴'] a:focus-visible,
tr[role='link']:focus-visible {
  outline: none;
}
```

---

## 3. 선택 가이드 (신규 UI)

```
클릭 가능한 한 줄(리스트·검색 결과)?
  ├─ 모달/카드 안 “행 카드” → A. 링 행 (평소 transparent 권장)
  ├─ <table> 안 데이터 행     → B. 테이블 행 (rowBase) 또는 A′. 링 테이블 (rowRing, 워치리스트)
  └─ 뉴스·기사형 (썸네일+제목) → C. 텍스트만

상단 GNB 탭? → D. 예외 (밑줄만)
```

| 하지 말기 | 이유 |
|-----------|------|
| GNB·테이블에 `--interactive-ring-hover` 그대로 복붙 | 박스 테두리처럼 보임 |
| 테이블 행에 항상 보이는 `border` + `border-spacing` 카드 배치 | “구분선/경계”가 항상 노출됨 |
| `:focus`에 링 (마우스 클릭 후) | 클릭한 행에 테두리가 남음 → `:focus-visible`만 링 |

---

## 4. 접근성

- 포커스는 **`:focus-visible`** 기준으로 링·배경을 준다.
- 마우스 클릭만 한 경우 `:focus:not(:focus-visible)` → 전역·컴포넌트에서 `outline: none`.
- `tr` 등 커스텀 포커스는 `tabIndex={0}` + `role="link"` + 키보드 핸들러 유지.

---

## 5. 변경 이력 (요약)

| 날짜 | 내용 |
|------|------|
| 2026-05-21 | 검색 모달 `.searchRow` 링 행 확립 (`feat/design-refresh`) |
| 2026-05-22~23 | 테이블·GNB·뉴스·TOP3에서 “항상 보이는 테두리” 제거, 패턴별 분리 |

상세 커밋은 `feat/design-refresh` changelog 및 git log 참고.

---

## 6. 관련 파일 빠른 찾기

| 패턴 | 주요 파일 |
|------|-----------|
| 토큰 | `src/styles/tokens.css` |
| 테이블 공유 | `src/components/common/interactiveTableRow.module.css` (`rowBase` / `rowRing`) |
| 링 테이블 (워치리스트) | `DashboardWatchlistTable.module.css` |
| 링 행 (TOP3) | `src/components/dashboard/BuzzSurgeTop3.module.css` |
| 링 행 (검색) | `src/components/common/TopNavSearchModal.module.css` |
| 텍스트만 | `src/components/stock/StockNewsListItem.module.css` |
| GNB | `src/components/common/TopNavMenu.module.css` |
| 전역 포커스 | `src/styles/global.css` |
