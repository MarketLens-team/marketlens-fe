# Change Log — 2026-05-27 · style: 저장 뉴스 섹션 피드 스타일 전환

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-27 |

## 요약

`MyPageBookmarkSection`의 Card 래퍼·헤더를 제거하고 전체 뉴스 피드와 동일한 플랫 스타일로 전환.
아이템 카드 테두리·배경 제거 → 상하 구분선만 유지.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.tsx` | `<Card>` → `<div>` · "저장한 뉴스" 헤더 · "뉴스 피드" 링크 제거 · `Card`·`CardSectionHeader`·`Link` import 정리 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.card` → `.section` (배경·테두리 없음) · `.item` 카드 스타일 → 상하 구분선만 · `.header`·`.feedLink` 제거 |

## 의도

- 메인 배경색(`--color-bg-app`)과 동일하게 — 전체 뉴스 피드와 동일한 맥락
- 섹션 타이틀은 마이페이지 사이드 nav("뉴스")가 역할 대신하므로 중복 제거
