# Change Log — 2026-06-05 · style · 종목 상세 연관 종목

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/stock-overview-missing-as-zero` |
| 화면 | 종목 상세(`/stock/:code`) · 우측 **연관 종목** 패널 |

## 요약

연관 종목 행에서 **감성 점수**를 제거하고 **현재가·등락률**만 남겼다. 좁은 사이드 컬럼에서 숫자 3개(가격·등락·감성)가 한 줄에 겹치며 공간을 많이 쓰던 문제를 줄였다.

## 변경 이유

- 헤더·차트·감성 분포에서 이미 감성 맥락을 제공 — 연관 종목까지 감성을 반복하면 정보 밀도가 높음
- 연관 종목 역할은 **같은 섹터 종목으로 빠르게 이동** — 시세(현재가·등락)가 더 적합
- 감성 점수 제거 후에도 로고·종목명·가격·등락 한 줄로 스캔 가능

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 연관 종목 trailing | 현재가 · 등락률 · 감성 점수 | 현재가 · 등락률 |
| 행 밀도 | `panelTitle` 하단 `space-5`, 기본 `stockLink` 크기 | 제목 여백·링크 패딩·글자 `sm`으로 축소 |
| trailing wrap | `flex-wrap` 허용 | `nowrap` — 한 줄 유지 |

## 파일

- `src/components/stock/StockDetailContent.tsx`
- `src/components/stock/StockDetailContent.module.css`

## 확인

- 종목 상세 우측 **연관 종목** — 로고·이름·현재가·등락률만 표시, 감성 점수 없음
- 등락 0%·양수·음수 색상은 기존 `priceChangeDirection` 규칙 유지
- 행 클릭 시 해당 종목 상세로 이동
