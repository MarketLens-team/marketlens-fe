# Change Log — 2026-05-28 · fix · 마이페이지 프로필 본문 폭·여백

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/responsive-layout` |
| 선행 | [2026-05-27-feat-mypage-profile-layout-ux.md](./2026-05-27-feat-mypage-profile-layout-ux.md) |

## 요약

2560px 등 넓은 화면에서 마이페이지 본문이 **약 768px(`48rem`)에 고정**되어 오른쪽에 큰 빈 영역이 생기던 문제를 수정했다.
탭 nav ↔ 본문 간격을 키우고, 본문은 nav 오른쪽부터 **가용 폭 전체**(우측 여백만 제외)를 쓰도록 변경했다.

## 증상 (왜 이렇게 보였나)

| 현상 | 원인 |
|------|------|
| 본문(카드·테이블)이 왼쪽에만 모이고 오른쪽이 텅 빔 | `.content`에 `max-width: 48rem` 고정 |
| 탭과 본문이 붙어 답답함 | `--profile-nav-gap: 0.25rem` (4px) |
| nav는 `fixed`인데 본문 offset이 nav 폭을 반영하지 않음 | `margin-left`가 gap만 적용되던 시기(문서·코드 불일치) — **반드시 `calc(nav-width + gap)`** |

`position: fixed` nav는 문서 흐름에서 공간을 차지하지 않는다. 본문은 `margin-left` + `width`로 nav 옆 슬롯을 **직접 계산**해야 한다.

## Changed

### `ProfileLayout.module.css`

| 변수/규칙 | 이전 | 이후 |
|-----------|------|------|
| `--profile-nav-gap` | `0.25rem` | `var(--space-5)` (20px) |
| `--profile-content-pad-end` | (없음) | `clamp(32px, 3.5vw, 64px)` |
| `.content` `margin-left` | `var(--profile-nav-gap)` 등 | `calc(nav-width + gap)` |
| `.content` 폭 | `min/max-width: 48rem` | `width: calc(100% - nav - gap - pad-end)` · `max-width: none` |

### `MyPage.module.css`

- `.page`에 `width: 100%` — 부모 main 안에서 가로를 꽉 채움

### `tokens.css` (같은 브랜치)

- `--layout-page-wide-cap: 160rem` — 초광폭에서 페이지 상한 2560px
- `--layout-sidebar-width: clamp(196px, 13vw, 260px)`

## Notes

- 본문 **컨테이너**는 넓어져도, 관심종목 **테이블**은 열 `width`(%, rem) 고정이라 행 안 빈 칸(현재가·등락 미표시 등)이 넓어 보일 수 있음 → 테이블 `width: 100%`·열 비율 조정은 별도 UX 과제
- 계정/알림 탭은 텍스트가 한 줄로 길게 늘어나 답답해 보일 수 있음 → `--layout-page-read-max` 래퍼 검토는 별도
