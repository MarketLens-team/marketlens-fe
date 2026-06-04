# Change Log - 2026-06-01 · style: 온보딩 칩·메인 배경 정리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

온보딩 관심종목 칩에서 로고 옆 `+`/`✓` 표시를 제거하고, `Layout.main` 배경을 `--color-bg-app`으로 통일해 페이지 shell과 이중 톤을 없앴다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/components/auth/SignupWatchlistStep.tsx` | 종목 칩 `chipMark` 제거 (로고 + 이름만) |
| `src/components/auth/SignupWatchlistStep.module.css` | `chipMark` 관련 스타일 제거 |
| `src/components/common/Layout.module.css` | `.main` 배경 `bg-section` → `bg-app` |

## 확인

- [ ] 온보딩 종목 칩에 `+`/`✓` 미표시, 선택은 칩 배경으로 구분
- [ ] 온보딩·기타 페이지 `main` 영역 배경 이중 톤 없음
