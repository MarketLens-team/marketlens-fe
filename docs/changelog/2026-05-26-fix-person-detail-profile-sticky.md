# Change Log — 2026-05-26 · fix/person-detail-profile-sticky

인물 상세 프로필 헤더 sticky 및 스크롤 시 피드 비침 마스킹.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 관련 | [2026-05-26-fix-person-page-grid-symmetry.md](./2026-05-26-fix-person-page-grid-symmetry.md) |

## 증상

- 발언 피드 스크롤 시 프로필(이름·아바타)이 함께 올라가거나, sticky가 체감되지 않음.
- sticky 적용 후에도 피드 텍스트가 헤더 **위쪽**에 한 줄씩 비침.

## 수정

| 파일 | 내용 |
|------|------|
| `PersonDetailPage.tsx` | `profileBlock`(프로필)과 `feedBody`(발언 목록)를 형제로 분리 — sticky는 피드와 같은 스크롤 컨텍스트의 래퍼에만 적용. |
| `PersonDetailPage.module.css` | `profileBlock`에 `position: sticky; top: 0`. `::before`로 헤더 위 `100dvh`를 `--color-bg-section`으로 덮어 지나가는 피드 가림. 타임라인 세로선은 `feedBody::before`로 이동. |

## Notes

- `data-scroll-root`(`.main`) 단일 스크롤 유지 — `main` 중첩 스크롤 없음.
- 좌·우 사이드바(TOP5·종목) 세로 시작 위치는 변경하지 않음.
