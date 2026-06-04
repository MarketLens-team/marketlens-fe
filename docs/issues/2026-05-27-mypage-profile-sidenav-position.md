# 마이페이지 프로필 사이드 nav — 탭 전환 시 위치 흔들림

| 항목 | 내용 |
|------|------|
| 상태 | fixed |
| 날짜 | 2026-05-27 |
| 관련 실험 | [prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md](../prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md) |
| 수정 커밋 | `b11e3f9` — `fix: 마이페이지 사이드 nav를 상단 네비 아래 고정` |
| fix changelog | [changelog/2026-05-27-fix-mypage-profile-sidenav-position.md](../changelog/2026-05-27-fix-mypage-profile-sidenav-position.md) |

## 1. 증상

- `/mypage` 좌측 탭(관심종목 / 뉴스 / 계정 설정)이 **탭을 바꿀 때마다** 화면에서 X·Y가 달라 보임.
- 특히 **계정 설정** 탭(콘텐츠 짧음) ↔ **관심종목** 탭(콘텐츠 김) 전환 시 체감이 큼.
- 사용자 기대: **상단 티커 + MarketLens topbar 바로 아래**, 탭 전환·스크롤과 무관하게 **같은 좌표에 박제**.

## 2. 실측 / 조사

| 확인 항목 | 결과 |
|-----------|------|
| 스크롤 컨테이너 | `Layout`의 `main[data-scroll-root]` (`overflow-y: auto/scroll`) |
| 초기 레이아웃 | `ProfileLayout` grid + `ProfileSideNav` `position: sticky; top: var(--main-pad-block)` |
| 탭 전환 | `useSearchParams`만 변경, **scrollTop 복원 없음** → 짧은 탭에서 스크롤바 유무가 바뀜 |
| fixed 시도(중간) | `top`을 `--main-pad-block`만 쓰면 **티커(26px)+topbar(56px) 미반영** → 상단 네비와 겹치거나 어긋남 |

## 3. 원인 (확정)

**한 줄:** 사이드 nav를 **스크롤 컨테이너(`.main`) 안에서 sticky**로 두었고, 탭마다 **문서 높이·스크롤바·scrollTop**이 달라져서 viewport 기준 좌표가 매번 달라졌다.

### 3.1 Sticky는 “고정”이 아님 (주원인)

- `position: sticky`의 기준 박스는 **가장 가까운 스크롤 조상** = `.main`.
- 탭 전환 시 오른쪽 패널 높이가 바뀌면:
  - `.main`의 **scrollTop이 그대로**이면 sticky 요소가 붙었는지/아직 flow인지 상태가 달라짐 → **Y가 달라 보임**.
- 사용자가 말한 “구역 나눠서 짱박아”는 **스크롤 플로우 밖** 좌표 고정인데, 구현은 계속 **같은 스크롤 플로우 안**에서 sticky만 조정함.

### 3.2 스크롤바 출몰 (부원인, 가로 밀림)

- 짧은 탭(계정 설정): `.main`에 스크롤바 없음 → 가용 너비 넓음.
- 긴 탭(관심종목): 스크롤바 생김 → 가용 너비 ~15px 감소.
- grid/sticky nav가 **가로로도** 살짝 움직인 것처럼 보임.
- 완화: `Layout.main`에 `scrollbar-gutter: stable` + `overflow-y: scroll` (`b11e3f9`).

### 3.3 `position: fixed` 오프셋 누락 (상단 네비 아래 요구 시)

- `fixed`는 **뷰포트** 기준. `.main`의 `padding-top`만 더하면 **티커+topbar(82px)** 가 빠짐.
- 최종: `top: calc(var(--layout-top-strip-height) + var(--main-pad-block))`, `left: var(--layout-main-pad-inline)`.

### 3.4 (기각) 활성 탭 `font-weight` / `min-height`

- 미세한 줄 높이 차이는 있을 수 있으나, **탭 전환마다 nav 전체가 움직이는** 현상의 주원인은 아님.

## 4. 수정

| 파일 | 내용 |
|------|------|
| `ProfileLayout.module.css` | nav 래퍼 `position: fixed`, top/left 토큰, content `margin-left` |
| `ProfileLayout.tsx` | nav를 `.nav` 래퍼로 분리 |
| `ProfileSideNav.module.css` | sticky 제거, width 100% |
| `Layout.module.css` | `scrollbar-gutter: stable` |

모바일(`≤720px`): nav `static`, content `margin-left: 0`.

## 5. 재현 / 확인

1. `/mypage` — 관심종목 ↔ 계정 설정 반복 클릭.
2. 좌측 nav가 **티커·topbar 아래 동일 위치**에 있는지, **가로·세로 밀림 없는지** 확인.
3. `.main` 스크롤 후 탭 전환 — nav는 움직이지 않고 본문만 스크롤.

## 6. 해결

- 커밋 `b11e3f9` (2026-05-27)
- [fix changelog](../changelog/2026-05-27-fix-mypage-profile-sidenav-position.md)
