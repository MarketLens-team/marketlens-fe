# Change Log - 2026-06-01 · style: 종목 목록 섹터 드롭다운 이관

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

`/dev/sector-filter`에서 선호한 Soft Gray 드롭다운 방향을 종목 목록(`/stock`) 섹터 필터에 이관했다.  
가로 칩 버튼 row를 제거하고 `select` 기반 드롭다운으로 교체해 메인 배경 위 가독성과 필터 역할을 분리했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/StockListPage.tsx` | 섹터 칩 버튼 row → `select` 드롭다운 UI |
| `src/pages/StockListPage.module.css` | Soft Gray 톤 드롭다운 스타일(연회색 배경·보더 대비·chevron) |

## 확인

- [ ] `/stock`에서 섹터 칩 row 대신 드롭다운 표시
- [ ] 섹터 변경 시 테이블 필터링 동작 유지
- [ ] 드롭다운이 메인 배경 위에서 충분히 보임
