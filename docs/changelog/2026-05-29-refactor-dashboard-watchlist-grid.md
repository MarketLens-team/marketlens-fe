# Change Log — 2026-05-29 · refactor: 홈 워치리스트 CSS Grid 전환

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/home-onboarding` |
| 작업일 | 2026-05-29 |

## 요약

홈 **내 관심 종목 워치리스트**를 `<table>` + `position: sticky` 열 고정에서 **CSS Grid**(`watchHeader` / `watchRow` 공통 `grid-template-columns`)로 전환했다. 헤더·행 컬럼 정렬 흔들림·호버 링 끊김·감성\|뉴스 경계 세로줄을 제거하고, 종목 페이지와 동일한 숫자·감성 표기를 맞췄다. 알림(🔔) 열·`hasAlert` 필드는 제거했다.

## Changed

| 파일 | 내용 |
|------|------|
| `components/dashboard/DashboardWatchlistTable.tsx` | `<table>` → Grid div · 종목 코드·`formatStockScore` · `ringRow` 행 클릭 |
| `components/dashboard/DashboardWatchlistTable.module.css` | `--watch-cols` · sticky 헤더(`top: 0`) · `ringRow` 호버 |
| `data/types/dashboard.ts` | `hasAlert` 제거 |
| `data/mappers/dashboardMapper.ts` | `hasAlert` 매핑 제거 |
| `data/mocks/dashboard.mock.ts` | 목 `hasAlert` 제거 |
| `docs/design/interactive-surfaces.md` | 홈 워치리스트 → Grid + `ringRow` (A′ `rowRing` 아님) |

## 설계 노트

- `table` + 좌측 4열 `sticky`는 `left` 오프셋·`border-collapse`·스크롤 컨테이너 패딩과 맞물려 헤더/호버가 스크롤에 밀리는 증상이 있었다.
- TanStack Table·가상 스크롤은 행 수 규모상 불필요. **헤더·행이 같은 grid template**을 쓰는 것이 정렬 문제의 핵심 해결책이다.
- 가로 스크롤 시 열 전체가 함께 움직인다(좌측 4열 단독 고정 없음). 카드 너비에서는 `minmax` 비율로 안정적이다.
- 호버: `interactiveListRow` **`ringRow`** (행 단위 border + `--interactive-ring-hover`).

## 확인

- [ ] `/` 로그인 후 워치리스트 — 헤더·행 컬럼 정렬 일치
- [ ] 가로·세로 스크롤 시 헤더 `sticky` 고정, 제목(카드 밖)은 고정
- [ ] 행 호버·Tab 포커스 링이 끊기지 않음
- [ ] 감성\|뉴스 사이 불필요한 세로줄 없음
- [ ] 행 클릭 → `/stock/:code`
