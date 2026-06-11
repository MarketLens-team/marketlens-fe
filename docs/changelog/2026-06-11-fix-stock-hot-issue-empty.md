# Change Log — 2026-06-11 · fix · 종목 상세 오늘 핫 이슈 빈 상태

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 종목 상세 `/stock/:code` — 헤더 「오늘 핫 이슈」 |
| 선행 | 인물·뉴스 사이드바 빈 상태 패턴 |

## 요약

`aiSummary`가 없거나 비어 있으면 라벨만 남고 본문이 빈 칸이던 문제를 고쳤다. 안내 문구를 표시한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 핫 이슈 본문 | `AiSummaryText`가 null 반환 → 빈 영역 | **「오늘 핫 이슈가 없습니다」** |

## 파일

- `src/components/stock/StockHeaderAiSummary.tsx`
- `src/components/stock/StockHeaderAiSummary.module.css`

## 확인

- [ ] `/stock/:code` — `aiSummary` 없음: 빈 상태 문구
- [ ] `/stock/:code` — 요약 있음: 기존 텍스트·더보기 동작
