# Change Log — 2026-05-29 · style: 뉴스 저장 별 버튼

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/home-onboarding` |
| 작업일 | 2026-05-29 |

## 요약

뉴스 피드·종목 상세 뉴스의 **저장(북마크) 버튼**을 관심종목 별(`StockWatchlistStarButton`)과 동일한 **투명 별(☆/★)** 스타일로 통일했다. 테두리·배경 박스를 제거하고, 저장됨 상태는 `--color-warning` 골드 별로 표시한다.

## Changed

| 파일 | 내용 |
|------|------|
| `components/news/NewsBookmarkButton.module.css` | 박스 UI 제거 · 별 토큰 스타일 |
| `components/news/NewsBookmarkButton.tsx` | 라벨 `뉴스 저장` / `저장 해제` |

## 확인

- [ ] 전체 뉴스·종목 상세 뉴스 — 저장 버튼 ☆/★ · 호버 골드
- [ ] 저장 후 ★ 유지 · 재클릭 시 해제
