# Change Log - 2026-06-01 · style: dev 섹터 선택 시안 확장

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/pill-ui-polish` |
| 작업일 | 2026-06-01 |

## 요약

섹터 선택 UI를 실제 페이지에 바로 적용하지 않고 `/dev`에서 먼저 비교 가능하도록 시안 페이지를 추가했다.  
칩/드롭다운 여러 방향을 확장해 비교한 뒤, 현재 기준으로 드롭다운 `Soft Gray` 방향을 선호안으로 확인했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/DevSectorFilterPage.tsx` | 섹터 선택 시안 비교 페이지 추가, 칩/드롭다운 다중 variant 구현 |
| `src/pages/DevSectorFilterPage.module.css` | 카드 제거(메인 바탕 직배치) + 대비 보정 + Soft Gray/Inset/Underline 드롭다운 시안 추가 |
| `src/router/index.tsx` | `/dev/sector-filter` 라우트 추가 |
| `src/pages/DevActionButtonPage.tsx` | `/dev` 링크 목록에 `Sector filter` 추가 |
| `docs/changelog/2026-06.md` | 6월 인덱스 항목 추가 |

## 확인

- [ ] `/dev/sector-filter`에서 칩/드롭다운 시안이 모두 렌더링됨
- [ ] 카드 래퍼 없이 메인 바탕색 위에서 시안 비교 가능
- [ ] `Soft Gray` 드롭다운이 배경 톤과 충돌 없이 가독성 유지
