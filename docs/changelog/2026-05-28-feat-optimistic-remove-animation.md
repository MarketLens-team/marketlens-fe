# Change Log — 2026-05-28 · feat: 낙관적 삭제 애니메이션 공통 패턴

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

리스트 아이템 삭제 시 API 완료를 기다리지 않고 즉시 UI에서 제거하는 낙관적 삭제 패턴을 공통 모듈로 추출.
`opacity` fade-out만 사용해 reflow 없이 GPU 가속으로 부드러운 애니메이션 구현.

## Added

| 파일 | 내용 |
|------|------|
| `components/common/optimisticRemove.module.css` | 공통 낙관적 삭제 애니메이션 모듈 (`.item` / `.itemRemoving`) |
| `docs/design/optimistic-remove-animation.md` | 패턴 설계 문서 — 동작 흐름·성능 근거·구현 템플릿 |

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.tsx` | 인라인 애니메이션 → `optimisticRemove.module.css` 공통 모듈 사용 · API fire-and-forget · `removingId` prop 제거 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.itemCollapse` / `.itemCollapsing` 인라인 정의 제거 |
| `pages/MyPage.tsx` | `handleBookmarkRemove` 동기 fire-and-forget · `removingBookmarkId` 상태 제거 |

## 적용 예정

- `MyPageWatchlistTable` — 관심종목 삭제에도 동일 패턴 적용 가능
