# Change Log - 2026-06-01 · style: FilterDropdown 공통 컴포넌트 추출

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

네이티브 `<select>` OS 팝업 대신 검색 모달 톤의 커스텀 드롭다운을 공통화했다. 옵션 hover/선택은 `ringRow` + `--interactive-ring-*` 패턴을 사용하고, 옵션 클릭 시 즉시 적용·닫기한다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/components/ui/FilterDropdown.tsx` | 공통 필터 드롭다운 (트리거·패널·Esc/바깥 클릭 닫기) |
| `src/components/ui/FilterDropdown.module.css` | Soft Gray 트리거, 모달 팔레트 패널, ringRow 옵션, 스크롤바 숨김 |
| `src/pages/StockListPage.tsx` | 섹터 필터를 `FilterDropdown`으로 교체 |
| `src/pages/StockListPage.module.css` | 페이지 전용 `.sectorSelect*` 스타일 제거 |

## 후속 (예정)

- 온보딩 등 다른 필터 UI에 `FilterDropdown` 재사용

## 확인

- [ ] `/stock` 섹터 드롭다운이 커스텀 패널로 열림
- [ ] 옵션 hover/선택 시 배경 채움 없이 ring만 표시
- [ ] 옵션 클릭 시 즉시 필터 적용·패널 닫힘
- [ ] Esc·바깥 클릭으로 패널 닫힘
