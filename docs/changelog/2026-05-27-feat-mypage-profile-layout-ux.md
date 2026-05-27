# Change Log — 2026-05-27 · feat · 마이페이지 프로필 레이아웃 UX

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | feat/design-refresh |
| 관련 | `b11e3f9` (사이드 nav fixed), `ProfileLayout` |

## 요약

마이페이지 프로필 탭 레이아웃을 CMC 설정 페이지에 가깝게 정리했다. 관심종목 탭에서 뉴스 섹션을 분리하고, 메인 컬럼 폭·nav 간격을 CSS 변수로 조정 가능하게 했다.

## Changed

### 탭 콘텐츠

| 탭 | 변경 |
|----|------|
| 관심종목 | 요약 카드 + 관심종목 테이블만 (저장 뉴스 제거) |
| 뉴스 | `MyPageBookmarkSection` 전용 |
| 계정 설정 | 계정 정보 + 알림 설정 (`tabPanel` 단일 컬럼) |

### 레이아웃 (`ProfileLayout.module.css`)

| 변수 | 용도 | 현재값 |
|------|------|--------|
| `--profile-nav-width` | 좌측 탭 nav 너비 | `13.75rem` |
| `--profile-nav-gap` | nav 오른쪽 ↔ 메인 시작 간격 | `0.2rem` |
| `.content` `max-width` | 메인 컬럼 최대 폭 | `48rem` |

- `.content` `margin-left`: `calc(var(--profile-nav-width) + var(--profile-nav-gap))` — fixed nav 아래 메인 시작점
- 간격만 바꿀 때: `--profile-nav-gap`만 수정 (nav 너비는 `--profile-nav-width`)

### 기타

- `MyPage.module.css`: 2열 `mainGrid` 제거 → `tabPanel` 단일 컬럼
- 로딩 스켈레톤: 관심종목 기준 테이블만

## Notes

- `margin-left`를 gap만 두면 fixed nav와 메인이 겹침 → 반드시 `nav-width + gap` calc 사용
