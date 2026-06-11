# Change Log — 2026-06-11 · fix · 검색 모달 행 선택(키보드·스크롤)

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 통합 검색 모달 (`TopNavSearchModal`) |

## 요약

키보드 ↑로 첫 행에 도달해도 선택이 해제되거나, 휠로 맨 위까지 올렸을 때 첫 항목이 하이라이트되지 않던 문제를 고쳤다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| ↑ at index 0 | `selectedRowIndex` → `-1`, 입력창 포커스 | **index 0 유지** (유한양행 등 첫 행 선택 표시) |
| 휠 스크롤 끝 | `pointermove`만 반영 → 맨 아래만 우연히 맞음 | `scroll` 시 **맨 위=0·맨 아래=마지막** 행 선택 동기화 |

## 파일

- `src/components/common/TopNavSearchModal.tsx` — `resolveSearchNavEdgeIndex`, `syncSelectionFromScroll`

## 확인

- [ ] 빈 검색 추천 목록 — ↑로 첫 행: 파란 테두리·선택 유지
- [ ] 휠로 맨 위·맨 아래: 첫·마지막 행 선택
- [ ] ↓·↑·Enter 행 이동·진입은 기존과 동일
- [ ] `p` 단축키로 검색 입력 포커스
