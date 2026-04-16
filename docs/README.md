# MarketLens Frontend Docs

## 왜 기록하는가

MarketLens 프론트엔드는 Dev 실험 -> 실페이지 반영 흐름을 사용합니다.  
코드/PR만으로는 "무엇이 바뀌었는지"는 보이지만, "왜 그렇게 결정했는지" 맥락이 끊기기 쉽습니다.

기록 목적:
- 변경 이유(맥락) 보존
- Before/After 근거 보존
- 나중에 재작업/회귀 시 추적 시간 단축

## 현재 불편사항과 대응

기존 불편사항:
- 머지 후에 판단 근거가 흩어짐
- 이미지 근거와 코드 변경(PR)이 분리됨
- 나중에 "왜 이 구조?" 질문에 답변 비용이 큼

대응 방식:
- 큰 결정은 DDR로 기록
- 일일 변경은 Changelog로 기록
- 화면 근거는 Snapshots로 고정 경로 관리

## 문서 맵 (권장 유지)

문서 맵은 유지하는 것이 좋습니다.  
폴더만 두면 신규 참여자/미래의 내가 문서 진입점을 찾기 어렵습니다.

- `docs/README.md` (이 문서)
  - 전체 목적/운영 규칙/진입 순서
- `docs/ddr/0001-dev-sidebar-migration.md`
  - DDR-0001 결정 기록 (Issue #7, PR #6 연계)
- `docs/dev-sidebar-migration.md`
  - 사이드바 도입 전/실험/반영 흐름 상세 로그
- `docs/changelog/2026-04.md`
  - 날짜별 변경 이력 ("무엇을 바꿨는지" 중심)
- `docs/snapshots/README.md`
  - 스냅샷 파일 인덱스 + DDR/PR 연결 규칙

## 기록 기준 (지금의 설계 방향)

- Dev에서 먼저 UI/인터랙션 검증
- 검증된 패턴만 실페이지에 반영
- 결정은 DDR, 변경 내역은 Changelog, 증거는 Snapshots에 기록

## PR/Issue에 무엇을 남길까

최소 항목만 남기면 충분합니다:
- Related Issue: `#번호`
- Refs DDR: `DDR-000X`
- Evidence: Before/Dev/After 스냅샷 경로
- PR 링크: 해당 DDR 또는 로그 문서에 역참조

예시:
- `Related: #7`
- `Refs: DDR-0001`
- `Evidence: docs/snapshots/2026-04-16/01-before-real.png -> docs/snapshots/2026-04-16/03-after-real.png`
