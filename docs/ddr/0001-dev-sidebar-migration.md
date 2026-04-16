# DDR-0001: Dev 사이드바 실험 후 실페이지 반영

## 상태
완료 (post-merge)

## 날짜
2026-04-16

## Related Issue
- #7

## Related PR
- [#6](https://github.com/MarketLens-team/marketlens-fe/pull/6)

## 맥락
- 실페이지에서 직접 UI를 반복 수정할 경우 회귀 위험이 컸다.
- 사이드바 탐색 구조(그룹/섹션 이동/active 동기화)를 안전하게 검증할 공간이 필요했다.
- AI 기반 구현 과정에서 컴포넌트 중복과 스타일 일관성 문제가 발생할 수 있었다.

## 결정
- 사이드바 관련 변경은 Dev 페이지에서 먼저 실험/검증한다.
- 검증된 패턴만 공통화하여 실페이지에 반영한다.
- 변경 근거는 Before -> Dev -> After 스냅샷 체인으로 관리한다.

## 근거 스냅샷
- Before: `docs/snapshots/2026-04-16/01-before-real.png`
- Dev Experiment: `docs/snapshots/2026-04-16/02-dev-page.png`
- After: `docs/snapshots/2026-04-16/03-after-real.png`
- Additional:
  - `docs/snapshots/2026-04-16/04-dev-main.png`
  - `docs/snapshots/2026-04-16/05-home-top-nav.png`
  - `docs/snapshots/2026-04-16/06-sidebar-minimal.png`
  - `docs/snapshots/2026-04-16/07-sidebar-glow.png`
  - `docs/snapshots/2026-04-16/08-sidebar-compact.png`

## 결과
- 상세 페이지에 섹션 기반 사이드바 패턴을 반영했다.
- 탐색 단위를 페이지 중심에서 섹션 중심으로 확장했다.
- 변경 판단 근거를 문서/스냅샷으로 추적 가능하게 만들었다.

## 트레이드오프
- Dev 실험 단계 추가로 초기 작업 시간은 증가한다.
- 대신 실페이지 회귀 리스크와 재작업 비용을 줄인다.

## 관련 문서
- `docs/dev-sidebar-migration.md`
- `docs/snapshots/README.md`
- `docs/changelog/2026-04.md`
