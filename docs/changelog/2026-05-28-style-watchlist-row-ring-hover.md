# Change Log — 2026-05-28 · style: 관심 종목 행 ring hover + 행 전체 클릭

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

관심 종목 테이블 행에 `rowRing` 패턴 적용.
hover·focus 시 primary ring이 표시되며, 행 전체 클릭으로 종목 상세 페이지로 이동.
삭제 버튼은 `e.stopPropagation()`으로 행 클릭과 분리.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageWatchlistTable.tsx` | `<tr onClick>` 추가 · `stockBtn(button)` → `div` 변환 · 삭제 버튼 `e.stopPropagation()` 추가 |
| `components/mypage/MyPageWatchlistTable.module.css` | `.row` `rowBase` → `rowRing` 교체 · `cursor: default` 제거 · `.stockBtn` button 전용 스타일 제거 |

## 설계 노트

- `rowRing` 패턴: `<tr>::after` pseudo-element로 ring 구현 (`border: 1px solid transparent` → hover `border-color: primary + box-shadow: interactive-ring-hover`)
- `stockBtn`을 `<button>`에서 `<div>`로 변환 — 클릭 이벤트는 `<tr>`이 담당해 중복 핸들러 제거
- 삭제 버튼만 `e.stopPropagation()`으로 행 클릭과 독립 처리
- 관련 패턴 문서: `docs/design/interactive-surfaces.md`
