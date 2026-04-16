# Snapshots

Dev 실험 -> 실페이지 반영 과정을 추적하기 위한 스냅샷 모음입니다.

## 폴더 구조

- [docs/snapshots/2026-04-16/](./2026-04-16)
  - 2026-04-16 작업 스냅샷 보관 폴더

## 파일 매핑 (2026-04-16)

| 번호 | 파일명 | 분류 | 설명 |
|---|---|---|---|
| 01 | [2026-04-16/01-before-real.png](./2026-04-16/01-before-real.png) | Before (실페이지) | 사이드바 적용 전 실서비스 기준 화면 |
| 02 | [2026-04-16/02-dev-page.png](./2026-04-16/02-dev-page.png) | Dev (사이드바) | Dev 페이지에서 사이드바 구조/동작 실험 화면 |
| 03 | [2026-04-16/03-after-real.png](./2026-04-16/03-after-real.png) | After (실페이지) | 사이드바 적용 후 실서비스 화면 |
| 04 | [2026-04-16/04-dev-main.png](./2026-04-16/04-dev-main.png) | Dev 메인 | 액션 버튼/실험 진입용 Dev 메인 페이지 |
| 05 | [2026-04-16/05-home-top-nav.png](./2026-04-16/05-home-top-nav.png) | Dev 홈 상단 | 홈 상단 Top Navigation UI |
| 06 | [2026-04-16/06-sidebar-minimal.png](./2026-04-16/06-sidebar-minimal.png) | Sidebar Variant | Minimal 스타일 사이드바 |
| 07 | [2026-04-16/07-sidebar-glow.png](./2026-04-16/07-sidebar-glow.png) | Sidebar Variant | Glow(Glassmorphism) 스타일 사이드바 |
| 08 | [2026-04-16/08-sidebar-compact.png](./2026-04-16/08-sidebar-compact.png) | Sidebar Variant | Compact/Grouped + Collapse 스타일 사이드바 |

## 핵심 변화 흐름

1. [2026-04-16/01-before-real.png](./2026-04-16/01-before-real.png)  
   사이드바 적용 전 실페이지 상태
2. [2026-04-16/02-dev-page.png](./2026-04-16/02-dev-page.png)  
   Dev 환경에서 사이드바 실험
3. [2026-04-16/03-after-real.png](./2026-04-16/03-after-real.png)  
   검증된 사이드바를 실페이지에 반영

위 3장은 "실험 -> 검증 -> 반영" 흐름의 핵심 증거로 사용합니다.

## DDR/PR 연결 규칙

- DDR에는 스냅샷 파일명을 날짜 폴더 포함 경로로 참조합니다.
  - 예: "근거 스냅샷: [01-before-real](./2026-04-16/01-before-real.png), [02-dev-page](./2026-04-16/02-dev-page.png), [03-after-real](./2026-04-16/03-after-real.png)"
- PR description에는 관련 DDR 번호와 스냅샷을 함께 남깁니다.
  - 예: `Refs: DDR-0004`
  - 예: "Before/After: [01-before-real](./2026-04-16/01-before-real.png) -> [03-after-real](./2026-04-16/03-after-real.png)"

## 확인 체크리스트

- [ ] Before/After 쌍이 있는가?
- [ ] Dev 실험 화면 근거가 있는가?
- [ ] DDR에 스냅샷 참조가 연결됐는가?
- [ ] PR 본문에 스냅샷 경로가 포함됐는가?
