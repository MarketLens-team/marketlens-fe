# Prompt Experiment — 마이페이지 사이드 nav: sticky 반복 vs viewport fixed

| 항목 | 내용 |
|------|------|
| 날짜 | 2026-05-27 |
| 세션 | Cursor 채팅 (동일 스레드, 다회 수정) |
| 관련 이슈 | [issues/2026-05-27-mypage-profile-sidenav-position.md](../issues/2026-05-27-mypage-profile-sidenav-position.md) |
| 해결 커밋 | `b11e3f9` |

## Goal

같은 버그(마이페이지 좌측 탭 위치 흔들림)에 대해, 사용자 프롬프트가 에이전트를 **어떤 수정 축**(sticky 조정 vs 스크롤 분리 vs viewport fixed)으로 보냈는지, 그리고 **왜 여러 번 실패했는지**를 남긴다.

**기술 원인(제품·코드)** 은 issues §3 — 여기서는 프롬프트·대응 패턴만 다룬다.

---

## 원인 한 줄 (issues와 동일 요약)

> **Sticky를 “고정”으로 오해하고 `.main` 스크롤 안에서만 `top`을 만졌기 때문.**  
> 탭마다 콘텐츠 높이·스크롤바·`scrollTop`이 달라져 viewport 기준 (x,y)가 바뀜.  
> **진짜 고정** = `position: fixed` + `top: 티커+topbar(82px) + main 패딩`.

---

## Experiment conditions

- **동일 맥락**: `/mypage`, ProfileLayout + ProfileSideNav, query `?tab=news|account`
- **스크롤 루트**: `Layout` → `main[data-scroll-root]`
- **초기 구현**: grid + `sticky` + `top: var(--main-pad-block)` (`59ac4d4`)
- **사용자 첨부**: 스크린샷(탭 위치 어긋남, 화살표로 기대 위치 표시)

---

## Prompt A — “탭 위치 고정 / space-8”

> 좌측에 탭 위치 고정해줘  
> (이후) space-8 기준으로 고정

### Exploration scope (추정)

- `MyPageSideNav.module.css`만 국소 수정
- “고정” → **`position: sticky` + `top: var(--space-8)`** 로 해석 (가로 여백 토큰을 세로 offset에 오적용)

### Result A

| 항목 | 결과 |
|------|------|
| 수정 | sticky + `top: space-8` |
| 사용자 반응 | **의도와 반대** — “space-8은 좌측 여백인데 왜 top?” |
| 근본 해결 | ❌ |

---

## Prompt B — “구역 나눠서 짱박아 / 탭 위치 영향 안 받게”

> 아니 탭 위치를 영향 안 받게 sticky도 sticky인데 구역을 나눠서 해당 위치 짱박아두라고 이해가 안 돼?  
> (이후) 메인 영역에 탭 포함돼서 그런 거 아니냐, 3번째 사진처럼

### Exploration scope (추정)

- 여전히 **sticky / 내부 스크롤 분리** 축 (MyPage `.content { overflow-y: auto }` 등)
- “구역 분리”를 **DOM 스크롤 분리**로만 읽고, **viewport 좌표 박제**까지는 안 감

### Result B (연쇄 시도)

| 시도 | 내용 | 실패 이유 |
|------|------|-----------|
| B1 | sticky `top: 0` → `top: var(--main-pad-block)` | sticky 한계 — scrollTop·콘텐츠 높이에仍 종속 |
| B2 | `.item` `min-height` 고정 | 항목 높이만 통일, **nav 컨테이너 좌표**는 그대로 |
| B3 | MyPage 내부 스크롤만 분리 | 탭은 여전히 `.main` 안; 전환 시 레이아웃·스크롤바 변화 유지 |
| B4 | `scrollTop` 저장/복원 | 증상 완화 시도였으나 **좌표계 자체**는 sticky+main |
| B5 | `scrollbar-gutter: stable`만 | 가로 밀림만 줄임, **세로 sticky 문제** 잔존 |

### Result B (사용자-facing)

- 다회 “고쳤다”고 했으나 **탭 전환 시仍 흔들림** → “시발 원인이 뭐냐” 수준의 불만

---

## Prompt C — “top nav 아래로”

> 위치가 top nav 아래로 해야지

### Exploration scope (추정)

- 드디어 **좌표 기준**을 viewport + 상단 스트립으로 인식
- `ProfileLayout` nav 래퍼에 `position: fixed`
- `top: calc(var(--layout-top-strip-height) + var(--main-pad-block))`

### Result C

| 항목 | 결과 |
|------|------|
| 수정 | `b11e3f9` — fixed + 티커/topbar 오프셋 + content `margin-left` |
| 사용자 기대 | ✅ 상단 네비 아래, 탭 전환 무관 |

---

## Difference

| 축 | Prompt A–B (대부분) | Prompt C |
|----|---------------------|----------|
| “고정” 해석 | sticky / 내부 overflow / item 높이 | **viewport `fixed`** |
| 좌표계 | `.main` 스크롤 조상 | **뷰포트 + layout 토큰** |
| top 계산 | `--main-pad-block`만 | **+ `--layout-top-strip-height`(82px)** |
| 탐색 파일 | SideNav, MyPage.module.css 위주 | **ProfileLayout**, tokens, Layout.main |
| 사용자 만족 | ❌ 반복 | ✅ (해당 커밋 기준) |

핵심: 사용자는 **“스크롤해도 안 움직이는 메뉴”**를 말했고, 에이전트는 **“스크롤 컨테이너 안에서 덜 움직이게”**만 반복했다.

---

## Reusable insight

1. **“고정 / 짱박 / 구역 나눠”** → 먼저 질문: *뷰포트 fixed인가, sticky인가?* sticky면 **어느 scroll container**인지 `data-scroll-root`부터 찍는다.
2. **탭 전환 + 짧은/긴 콘텐츠** 버그는 `font-weight`보다 **scrollbar-gutter + scrollTop + containing block**을 우선 본다.
3. **RootLayout이 티커+Layout(topbar)를 밖에 두는 구조**면, `fixed`의 `top`에 **`--layout-top-strip-height` 필수** — `.main` padding만으로는 부족.
4. 프롬프트에 **“sticky 말고 viewport 기준 fixed, scroll container 밖”** 한 줄이 있었으면 A–B 루프를 줄일 수 있었음.

---

## References

- [issues/2026-05-27-mypage-profile-sidenav-position.md](../issues/2026-05-27-mypage-profile-sidenav-position.md) — 증상·원인·수정 표
- [changelog/2026-05-27-fix-mypage-profile-sidenav-position.md](../changelog/2026-05-27-fix-mypage-profile-sidenav-position.md)
- 커밋: `59ac4d4` (grid+sticky 도입) → `b11e3f9` (fixed)
