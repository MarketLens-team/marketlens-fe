# Change Log - 2026-06-01 · style: 종목 상세 관심종목 토글 이관

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 커밋 | `d138da8` |
| 작업일 | 2026-06-01 |

## 요약

`/dev/watchlist-button`에서 확정한 C안 방향을 종목 상세 헤더에 이관했다.  
별/텍스트를 단일 버튼으로 묶어 hover/focus 반응을 일치시키고, 기본 상태의 과한 강조를 줄였다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/components/stock/StockDetailContent.tsx` | `PillButton` 기반 토글을 단일 `button`(별 + 텍스트) 구조로 교체 |
| `src/components/stock/StockDetailContent.module.css` | 기본 `text-secondary`, hover 시 `text-primary`, ON 상태 별 `--color-warning` 유지, spacing/size 조정 |

## 확인

- [ ] 종목 상세 헤더에서 기본 상태 텍스트가 과하게 강조되지 않음
- [ ] hover 시 별/텍스트가 함께 강조 반응
- [ ] ON 상태에서 별만 warning 색으로 표시
