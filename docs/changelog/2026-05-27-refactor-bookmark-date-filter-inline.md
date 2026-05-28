# Change Log — 2026-05-27 · refactor: 북마크 날짜별 보기 모달 → 인라인 필터 전환

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-27 |

## 요약

달력 날짜 클릭 시 별도 모달로 기사 목록을 보여주던 방식을,
메인 목록에 `publishedDate` 필터를 적용하는 인라인 방식으로 전환.
목록 상단에 선택된 날짜를 헤더로 표시하고, 버튼 상태 변화로 필터 해제.

## 변경 이유

- 모달 위 모달(달력 피커 → 날짜 상세) 구조가 UX상 부자연스러움
- 이미 있는 목록에서 필터만 바꾸는 게 컨텍스트 유지에 더 적합
- 날짜 헤더가 목록 영역 안에 있어서 "이 날 기사를 보는 중"이 직관적으로 전달됨

## Changed

| 파일 | 내용 |
|------|------|
| `hooks/useMyPageBookmarks.ts` | `modalDate` / `modalItems` / `modalLoading` / `openDateModal` / `closeDateModal` 제거 → `filterDate` / `selectDate` / `clearDateFilter` 로 교체. `listFactory`에 `publishedDate: filterDate` 반영 |
| `components/mypage/MyPageBookmarkSection.tsx` | 날짜 상세 모달 제거 · 날짜 선택 시 `onDateSelect` 호출 · `filterDate` 활성 시 목록 상단에 날짜 헤더(`YYYY년 M월 D일 요일`) 표시 · 달력 버튼 활성 상태에서 × 클릭으로 필터 해제 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.calendarBtnActive` · `.calendarBtnClear` · `.filterDateLabel` 추가 |
| `pages/MyPage.tsx` | `modalDate` 계열 → `filterDate` / `selectDate` / `clearDateFilter` 로 구조분해 교체 |

## 흐름

```
[📅 5. 27.]  클릭
    → 달력 피커 모달
    → 날짜 클릭
    → 모달 닫힘 + 목록 publishedDate 필터 적용

목록 영역:
  2026년 5월 27일 화요일
  ───────────────────
  [기사 1] [기사 2] ...

[📅 5. 27. ×]  → 클릭하면 필터 해제, 전체 목록으로 복귀
```
