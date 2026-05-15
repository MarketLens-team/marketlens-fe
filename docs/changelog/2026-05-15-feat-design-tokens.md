# Change Log — 2026-05-15 · feat/design-tokens

브랜치 `feat/design-tokens`에서 진행한 **디자인 토큰·Stylelint·CSS 마이그레이션** 작업 기록입니다.  
월별 파일(`2026-05.md`)보다 이 문서가 브랜치 단위 진입점입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-tokens` |
| 작업일 | 2026-05-15 |
| 베이스 | `6343ae6` (merge #9 이후) |
| 관련 PR | _(merge 후 URL 추가)_ |
| 스냅샷 | 없음 (인프라/토큰 PR — 화면 픽셀 변경 최소) |

## 요약

프로덕션 CSS에서 색·타이포·spacing·radius를 `tokens.css`로 통일하고, Stylelint로 hex·named color·`font-size` px를 막음. layout·motion·z-index 반복값을 토큰화. `.text-*` typography 유틸은 **파일만 추가**, 컴포넌트 적용은 후속.

## Added

### 스타일 기반

- `src/styles/tokens.css` — semantic 색, 7단 `font-size`, spacing, radius, layout·motion·z-index
- `src/styles/typography.css` — `.text-caption` ~ `.text-display`, `.text-mono*` (전역 import: `index.css`)
- `.cursor/rules/marketlens.mdc` — 토큰 판단 표, 작업 후 grep 승격, 린트 규칙

### Stylelint

- `.stylelintrc.cjs`, `npm run lint:css`, `npm run lint`에 포함
- 금지: `#hex`, named color, `rgb`/`rgba`/`hsl`/`hsla`, `font-size`의 `px`
- 제외: `tokens.css`, `Dev*.module.css`
- 보류: spacing·radius `px` (1~2px 보정 노이즈)

### 토큰 (layout · motion · layer)

| 토큰 | 값 | 적용 예 |
|------|-----|---------|
| `--layout-page-max` | 1200px | Dashboard, Admin, StockDetail shell 등 8곳 |
| `--layout-modal-search` | 720px | TopNavSearchModal, DevSearchModal |
| `--layout-sidebar-accordion` | 260px | DetailSplitShell, DevLayoutSplit |
| `--duration-instant` ~ `--duration-moderate` | 120~200ms | hover/transition 공통 |
| `--z-popover` / `--z-dropdown` / `--z-overlay` / `--z-toast` | 20 / 40 / 1000 / 1250 | 팝오버·설정·모달·스낵바 |

## Changed

- **ui / common / pages / dashboard / auth** — `#hex`·레거시 alias(`--bg`, `--t1` 등) 제거 → `var(--color-*)`, `var(--space-*)`, `var(--font-size-*)`
- **TSX** — `ScoreTag`, `SentimentPill`, `SentimentMiniSparkline`, `DashboardPage`, `NewsDetailModal` 등 인라인 색/차트 CSS 변수 정리
- **SentimentPill** — 인라인 스타일 → `SentimentPill.module.css`
- **Dev 공용** — TopNav, Settings, Search, Watchlist CSS 토큰 정리 (색 hex는 ignore 구간)
- **TickerBar** — mask `black` → `var(--color-text-primary)` (named color 린트)

## 아키텍처 (3층)

1. `tokens.css` — 원자값 (hex/px 리터럴은 여기만)
2. `typography.css` — 역할 유틸 `.text-*`
3. `*.module.css` — 레이아웃; 반복 의미만 토큰, 컴포넌트 전용 치수는 Module에 유지

## 의도적으로 하지 않음 (후속)

- `.text-*` TSX/Module **미적용** (0곳 사용)
- Recharts `fontSize: 10|12` 숫자 상수
- spacing·radius px Stylelint
- 브레이크포인트 `@media` 통일
- Dev 실험 페이지 hex·임의 px (stylelint ignore)
- Alert `480px`, Modal `560px`, NewsDetail `760px` 등 단일 컴포넌트 고정 치수
- DDR-0002 (패턴 고정 시 선택)

## 커밋 (시간순)

1. `1295217` — font-size·spacing·radius 스케일 및 typography 유틸 추가
2. `1a585af` — Stylelint hex/rgba, `lint:css`
3. `8717989` — common CSS 마이그레이션
4. `2469aa8` — pages·dashboard·login CSS 마이그레이션
5. `b10f493` — 레거시 CSS alias 제거
6. `9007dd8` — SentimentPill·Dev 공용·lint 통합
7. `adc77c2` — layout·motion·z-index 토큰 및 적용
8. `47e2083` — font-size px·named color·hsl Stylelint 강화

## 확인

```bash
npm run lint    # eslint + stylelint
npm run build
```

- `/`, `/stock`, `/login`, TopNav 모달·설정, `/admin/*`
