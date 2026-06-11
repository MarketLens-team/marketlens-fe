# Change Log — 2026-06-11 · fix · KOSPI 종합 도움말 ⓘ

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 홈 `/` — KOSPI 종합 (`DashboardKospiChip`) |
| 선행 | `8d70fea` KOSPI 지수·등락률 도움말 |

## 요약

배포 환경에서 `kospi-index` API 실패 시 ⓘ 버튼이 **아예 렌더되지 않던** 문제를 고치고, 툴팁을 **감성 점수 구간별 설명**·**더 큰 `size="md"`** 로 개선했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| ⓘ 표시 조건 | `kospiIndex != null` 일 때만 | **항상** 표시 (지수 실패 시 안내 문구) |
| 감성 설명 | "게이지는 뉴스 감성 점수입니다." | `현재 KOSPI 전체 감성 점수는 N점으로 {라벨} 상태입니다.` + 구간 해설 |
| 툴팁 크기 | `HelpTooltip` 기본(sm) | KOSPI에 `size="md"` — 버튼·팝오버·본문 글자 확대 |

## 툴팁 구성

1. **지수** — KOSPI {index} · {등락률} (로딩/실패 시 대체 문구)
2. **감성 요약** — `sentimentLabel(score)` 와 게이지 중앙 라벨 동일
3. **구간 해설** — `getSentimentInterpretation(score)` (강한 부정 ~ 강한 긍정)

## 파일

- `src/components/dashboard/DashboardKospiChip.tsx`
- `src/components/dashboard/DashboardKospiChip.module.css`
- `src/components/ui/HelpTooltip.tsx` · `.module.css` — `size="md"` variant

## 확인

- [ ] 지수 API 없어도 KOSPI 카드 우측 ⓘ 표시
- [ ] 호버 시 지수·감성 점수·구간 설명 3단 표시
- [ ] 게이지 점수(예: 12)와 툴팁 라벨(중립) 일치
- [ ] 툴팁·ⓘ 크기가 이전보다 읽기 편함

## 비고

- 백엔드 `GET /api/v1/stocks/kospi-index` 미배포 시 지수 줄만 실패 문구, ⓘ·감성 설명은 정상
