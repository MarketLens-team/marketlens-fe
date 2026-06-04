# Change Log — 2026-05-26 · style/breadcrumb-colors

상세 화면 **Breadcrumb** 색·호버를 상단 탭·`PillButton` primary와 맞춤.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| 선행 | `69e7353` — 브레드크럼·`/stock` 목록·DDR-0002 |
| DDR | [DDR-0002](../ddr/0002-detail-breadcrumb-navigation.md) |

## 요약

부모 경로는 본문과 같은 **흰색**, 현재 페이지는 **primary**로 강조한다. 부모 링크는 호버·포커스 시 primary로 바뀌어 클릭 가능함을 드러낸다.

## Changed

| 요소 | 색·동작 |
|------|---------|
| 부모 링크 (`인물 발언`, `전체 종목`) | `--color-text-primary` |
| 부모 호버·`:focus-visible` | `--color-primary` (상단 탭 active·관심종목 버튼과 동일 토큰) |
| 현재 페이지 (`이재용`, `삼성전자` 등) | `--color-primary`, `font-size-lg` + semibold |
| 구분자 `/` | `--color-text-muted` |

| 파일 | 내용 |
|------|------|
| `src/components/common/Breadcrumb.module.css` | 위 색·`@media (hover: hover)` 호버 분기 |

## Notes

- 인물·종목 상세는 동일 컴포넌트만 사용 — 페이지별 CSS 없음.
- 스냅샷 `docs/snapshots/2026-05-26/02·03`은 회색 초안 기준이며, 색 반영 후 재촬영은 선택.
