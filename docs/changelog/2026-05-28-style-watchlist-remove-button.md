# Change Log — 2026-05-28 · style: 관심 종목 삭제 버튼 ghost circle 통일

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

관심 종목 삭제 버튼을 북마크 삭제 버튼과 동일한 ghost circle 스타일로 통일.
`×` 문자 → `XIcon` SVG로 교체해 두 섹션의 시각적 일관성 확보.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageWatchlistTable.tsx` | `×` 문자 → `XIcon` SVG 컴포넌트로 교체 |
| `components/mypage/MyPageWatchlistTable.module.css` | `.removeBtn` border 제거 → `border-radius: 50%` ghost circle · hover 시 danger 배경 |

## 이전 → 이후

| 항목 | 이전 | 이후 |
|------|------|------|
| 모양 | 사각 테두리 버튼 (`border-radius: sm`) | 원형 ghost 버튼 (`border-radius: 50%`) |
| 아이콘 | `×` 문자 | `XIcon` SVG (10×10) |
| hover | `border-color: strong` + `color: danger` | `color: danger` + `background: danger 10%` |
| disabled | `opacity: 0.5; cursor: wait` | `opacity: 0.4; cursor: wait` |
