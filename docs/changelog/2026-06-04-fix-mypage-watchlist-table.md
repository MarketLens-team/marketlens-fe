# Change Log — 2026-06-04 · fix · 마이페이지 관심종목 테이블 표시

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage` · 관심종목 탭 · 관심 종목 리스트 |

## 요약

관심종목 테이블의 등락·언급률 색상 오류, 언급률 0 표기, 숫자 열 정렬 불일치를 종목 목록(`StockOverviewTable`) 규칙에 맞춰 수정했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 등락 색상 | 상승 빨강 · 하락 파랑 | 상승 초록 · 하락 빨강 |
| 언급률 0 | `—` | `0%` |
| 언급률 색상 | 항상 빨강 | 양수 초록 · 음수 빨강 · 0 기본색 |
| 숫자 열 정렬 | 헤더 가운데 · 데이터 오른쪽 | 헤더·데이터 모두 오른쪽 (`tabular-nums`) |

## 파일

- `src/components/mypage/MyPageWatchlistTable.tsx`
- `src/components/mypage/MyPageWatchlistTable.module.css`

## 확인

- 등락 `-4.24%` 빨강 · `+1.46%` 초록
- 언급률 `0%` 표시 · `+60%` 초록 · `-41%` 빨강
- 현재가·등락·감성·언급률 헤더와 값 세로 정렬 일치
