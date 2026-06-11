# Change Log — 2026-06-11 · fix · 인물 페이지 TOP 5 빈 상태·맨 위로 FAB

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 인물 발언 `/person` · 인물 상세 `/person/:id` |
| 선행 | 우측 「자주 언급된 종목」 빈 상태 문구 패턴 |

## 요약

언급량 TOP 5 인물 패널에 데이터가 없거나 언급 수가 0이면 안내 문구를 보여 주고, 맨 위로 버튼은 페이지를 아래로 스크롤한 뒤에만 나타나도록 맞췄다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| TOP 5 패널 | 목록이 비어 있으면 카드 본문이 빈 칸 | `mentionCount > 0` 항목만 표시, 없으면 **「언급 인물 데이터가 없습니다」** |
| 맨 위로 FAB | `PageFabRail alwaysVisible` — 항상 표시 | 스크롤 200px 이상 후 표시 (`on-scroll`, 뉴스 피드와 동일) |

## 파일

- `src/components/person/PersonTop5Panel.tsx`
- `src/components/person/PersonTop5Panel.module.css`
- `src/pages/PersonTrackerPage.tsx`
- `src/pages/PersonDetailPage.tsx`

## 확인

- [ ] `/person` — TOP 5 데이터 없음·0건: 좌측 패널에 빈 상태 문구
- [ ] `/person` — TOP 5 데이터 있음: 기존 순위 목록
- [ ] `/person` — 페이지 최상단: 맨 위로 버튼 숨김
- [ ] `/person` — 아래로 스크롤: 맨 위로 버튼 표시·클릭 시 상단 이동
- [ ] `/person/:id` — 맨 위로 버튼 동일 동작
