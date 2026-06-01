# Change Log - 2026-06-01 · style: 종목 목록 섹터 드롭다운 레이아웃 정리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

섹터 Soft Gray 드롭다운 이관 후 UI를 정리했다. `섹터` 라벨·`N종목` 메타를 제거하고, 드롭다운과 테이블을 `tableSection`으로 묶어 간격을 조정했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/StockListPage.tsx` | 라벨/메타 제거, `tableSection`으로 필터+테이블 그룹화 |
| `src/pages/StockListPage.module.css` | `tableSection` gap/padding-top 조정, 미사용 meta 스타일 제거 |

## 후속 (예정)

- 네이티브 `<select>` 팝업은 OS 스타일이라 커스텀 메뉴 필요
- 팔레트는 검색 모달(`--color-bg-modal`, `--color-bg-modal-inset`) 톤 재사용 검토

## 확인

- [ ] `/stock`에서 섹터 라벨·종목 수 문구 미표시
- [ ] 랭킹 카드 ↔ 드롭다운 상단 여백 자연스러움
- [ ] 드롭다운 ↔ 테이블 간격이 과하지 않음
