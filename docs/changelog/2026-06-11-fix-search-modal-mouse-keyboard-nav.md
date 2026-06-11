# Change Log — 2026-06-11 · fix · 검색 모달 마우스·키보드 행 탐색 분리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 통합 검색 모달 (`TopNavSearchModal`) |

## 요약

마우스 호버와 키보드 ↑↓ 선택이 같은 `selectedRowIndex`·`scrollIntoView` 경로를 공유해, 스크롤 영역 가장자리에 살짝 가려진 항목에 커서를 올리면 목록이 자동으로 조금 밀리던 문제를 고쳤다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 마우스 호버 | `pointermove` → 행 선택 → `scrollIntoView` | CSS `:hover`만 (자동 스크롤 없음) |
| 키보드 ↑↓ | 선택 + `scrollIntoView` | 동일 (`scrollSelectedRowIntoViewRef`로 한정) |
| 키보드 → 마우스 | 호버가 선택을 덮어씀 | 리스트 `pointermove` 시 키보드 선택 해제 → 호버 모드 |
| 휠 스크롤 끝 | 맨 위·아래 행 선택 | 유지 (`scrollIntoView` 없음 — 이미 끝) |

## 파일

- `src/components/common/TopNavSearchModal.tsx` — `scrollSelectedRowIntoViewRef`, `dismissKeyboardSelectionOnPointer`

## 확인

- [ ] 추천·검색 결과 목록 — 가장자리 항목 호버 시 자동 스크롤 없음
- [ ] ↑↓ 키보드 탐색 — 선택 행이 보이도록 스크롤
- [ ] 키보드 선택 후 마우스 이동 — 파란 선택 링 해제, 호버 하이라이트만
- [ ] 휠로 맨 위·맨 아래 — 첫·마지막 행 선택 유지
- [ ] Enter 행 진입·`p` 검색 포커스는 기존과 동일
