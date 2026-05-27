# Pull Request — `feat/design-refresh`

> GitHub PR 본문에 붙여 넣을 초안입니다.  
> 상세는 [changelog/2026-05.md](./changelog/2026-05.md) 및 날짜별 `feat-*` / `fix-*` 문서를 참고하세요.

## Summary

MarketLens 프론트 **디자인 리프레시** 브랜치입니다. 디자인 토큰·공통 UI(Modal, TextField, ActionButton) 정리 위에, 홈/종목/인물/뉴스/마이페이지·인증·검색 모달을 CMC 스타일에 가깝게 맞추고, **anchored 뉴스·인물 피드** 양방향 페이지네이션·세션 복원·북마크·시세 연동을 포함합니다.

- **범위**: UI/UX·클라이언트·훅 중심 (백엔드 스펙은 OpenAPI/mock 병행)
- **문서**: `docs/changelog/`, `docs/issues/`, `docs/prompt-experiments/`, `docs/ddr/`
- **에셋**: `public/images/stocks`, `public/images/persons` (정적 아바타)

---

## 1. 기반 · 공통

| 영역 | 요약 | Changelog |
|------|------|-----------|
| 디자인 토큰 | 색·타이포 8단계·spacing·layout·motion·z-index, Stylelint | [2026-05-15-feat-design-tokens](./changelog/2026-05-15-feat-design-tokens.md) |
| 인터랙티브 패턴 | `ringRow` / 테이블 행 ring / primary 링 호버 통일 | [interactive-surfaces.md](./design/interactive-surfaces.md) |
| Modal · TextField · ActionButton · AlertModal | 단일 진입점·로딩/위험 상태 | core-pages·design-refresh 각 문서 |
| Layout | 상단 네비·티커 시세·좌측 사이드바 기본 숨김·`DetailSplitShell` | [feat/core-pages](./changelog/2026-05-19-feat-core-pages.md) |
| 에러 UX | `AppErrorPage`·`PageFetchError`·HTTP 풀스크린 | [2026-05-20-feat-core-pages-frontend](./changelog/2026-05-20-feat-core-pages-frontend.md) |

---

## 2. 인증 · 온보딩

| 영역 | 요약 | Changelog |
|------|------|-----------|
| 로그인·회원가입 | 탭형 AuthPanel·OTP·필드 검증 | [auth-login-signup](./changelog/2026-05-19-feat-auth-login-signup.md) |
| 탑 네비 로그인 모달 | 공개 라우팅·비밀번호 찾기·리다이렉트 | [design-refresh-auth](./changelog/2026-05-21-feat-design-refresh-auth.md) |
| Refresh token | reissue·401 재시도·세션 복구 | [auth-session](./changelog/2026-05-21-feat-design-refresh-auth-session.md) |
| 온보딩 | 관심 종목·알림 설정 단계 | auth 문서·`OnboardingPage` |

---

## 3. 홈 · 종목 · 인물

| 영역 | 요약 | Changelog |
|------|------|-----------|
| 홈 대시보드 | Treemap·게이지·워치리스트·비로그인 유도 | [dashboard-home-refresh](./changelog/2026-05-26-feat-dashboard-home-refresh.md) |
| 워치리스트 시세 | `prices` API 병합 | [fix-dashboard-watchlist-prices](./changelog/2026-05-26-fix-dashboard-watchlist-prices.md) |
| `/stock` 전체 종목 | overview·rankings·테이블·Binance형 카드 | [stock-overview-page](./changelog/2026-05-26-feat-stock-overview-page.md) |
| 브레드크럼 | 상세 ‹ → 목록·primary 색 | [DDR-0002](./ddr/0002-detail-breadcrumb-navigation.md), [style-breadcrumb](./changelog/2026-05-26-style-breadcrumb-colors.md) |
| 종목 상세 | 감성 차트·인물 타임라인·뉴스 피드·FAB·`imageUrl` | [design-refresh-stock-detail](./changelog/2026-05-21-feat-design-refresh-stock-detail.md), [stock-person-integration](./changelog/2026-05-26-feat-design-refresh-stock-person-integration.md) |
| 인물 트래커·상세 | 3열·댓글형 타임라인·기간 토글·`statementId` 강조 | [person-pages](./changelog/2026-05-22-feat-design-refresh-person-pages.md), [person-timeline](./changelog/2026-05-23-feat-design-refresh-person-timeline.md) |
| 검색 모달 | 통합 검색·`P` 포커스·종목/뉴스/인물 라우팅 | [design-refresh-search-modal](./changelog/2026-05-21-feat-design-refresh-search-modal.md) |

---

## 4. 뉴스 피드 · 북마크

| 영역 | 요약 | Changelog |
|------|------|-----------|
| `/news` 전체 피드 | cursor·around/newer/older·관련 종목 태그 | [all-news-feed](./changelog/2026-05-26-feat-all-news-feed.md) |
| 사이드바·관심 탭 | today-news·2열 레이아웃 | [news-feed-watchlist-sidebar](./changelog/2026-05-26-feat-news-feed-watchlist-sidebar.md) |
| session 복원 | `sessionStorage`·`?newsId=` 포커스·FAB | [news-feed-session-navigation](./changelog/2026-05-26-feat-news-feed-session-navigation.md) |
| 북마크 | API·`ALL_NEWS`/`STOCK`·☆ 버튼 | [news-bookmarks](./changelog/2026-05-26-feat-news-bookmarks.md) |
| anchored 피드 | 양방향 커서·merge·스크롤 보정 | [fix-anchored-feed-pagination](./changelog/2026-05-26-fix-anchored-feed-pagination.md) 및 person/news fix 시리즈 |
| newer/older UX | prepend 잠금·IO 루프·종목 피드 정렬 | [fix-news-feed-newer-scroll-ux](./changelog/2026-05-27-fix-news-feed-newer-scroll-ux.md), [fix-news-feed-older-scroll-ux](./changelog/2026-05-27-fix-news-feed-older-scroll-ux.md) |
| 종목 `newsId` | 클릭해도 URL·초록 제목 유지 | [fix-stock-detail-newsid-persist](./changelog/2026-05-27-fix-stock-detail-newsid-persist.md) |

---

## 5. 마이페이지 (`/mypage`) — 이번 스프린트 후반 집중

### 라우팅·탭

| 탭 | URL | 내용 |
|----|-----|------|
| 관심종목 | `/mypage` | 요약 카드 + watchlist 테이블 (`imageUrl`·EntityAvatar) |
| 뉴스 | `/mypage?tab=news` | 저장 뉴스 (날짜별/종목별) |
| 계정 설정 | `/mypage?tab=account` | 계정 정보 + 알림 설정 |

### 레이아웃

- **ProfileLayout**: 좌측 `ProfileSideNav` `position: fixed` (티커+topbar 아래), 메인 `max-width: 48rem`
- **nav–메인 간격**: `--profile-nav-gap` (의도적; `margin-left`는 gap만 사용하는 설정 — changelog 참고)
- **관심종목 탭**: 북마크 뉴스 섹션 제거 (뉴스 탭으로 분리)

### 사이드 탭 스타일

- hover: `ringRow` (비선택만) · 배경 채움 없음
- 선택: `--color-primary-on-surface` (토글 ON `--color-primary`와 체감 맞춤), `font-size: xl`, 아이콘 1.5rem
- 토큰: `--color-primary-on-surface` in `tokens.css`

### 계정 설정 UI

- **계정 정보**: Card 제거 · 플랫 세로 필드 (`xl` 값)
- **알림 설정**: CMC형 토글 리스트 · 알림 예시 UI 제거
- **구분선**: 계정 정보 ↔ 알림 설정 `border-strong` (`sectionDivider`)

### 관련 커밋 (마이페이지·근접)

```
aacee0e feat: 관심종목 watchlist imageUrl 연동 및 마이페이지 알림 컬럼 제거
59ac4d4 feat: 마이페이지 프로필 사이드 레이아웃 도입
b11e3f9 fix: 마이페이지 사이드 nav를 상단 네비 아래 고정
13deb8f feat: 마이페이지 프로필 탭 레이아웃·nav 간격 정리
6a1fd43 feat: 마이페이지 알림 설정 플랫 UI
7bb7eee feat: 마이페이지 계정 설정 탭 UI 정리
d72c70f feat: 마이페이지 사이드 탭 선택 색을 primary로 통일
d2d74cc fix: 마이페이지 선택 탭 primary 체감 색 맞춤
0821442 style: 마이페이지 사이드 탭 폰트 크기 확대
7b41740 feat: 마이페이지 계정·알림 설정 섹션 구분선
690a318 feat: 마이페이지 북마크 날짜별·종목별 탭 API 연동
```

### 조사 문서

- [issues/2026-05-27-mypage-profile-sidenav-position.md](./issues/2026-05-27-mypage-profile-sidenav-position.md) — sticky vs fixed 원인
- [prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md](./prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md)

---

## 6. 기타 fix·문서 (요약)

- 종목 뉴스 무한 스크롤 센티넬: [issues](./issues/2026-05-26-stock-news-pagination.md)
- 인물 발언 정렬·로딩·그리드·sticky·맨 위로: `2026-05-26-fix-person-*` 시리즈
- `docs/issues` · `docs/prompt-experiments` 운영 구조: [2026-05-26-docs-issues-prompt-experiments](./changelog/2026-05-26-docs-issues-prompt-experiments.md)

---

## Test plan

### 공통

- [ ] `npm run build` 통과
- [ ] `npm run lint:css` 통과
- [ ] `VITE_USE_MOCK_DATA=true` / `false` 각각 주요 플로우 스모크

### 인증

- [ ] 로그인·회원가입·로그아웃·401 시 로그인 모달
- [ ] refresh·탭 복귀 후 세션 유지

### 홈 · 종목 · 인물

- [ ] `/` 대시보드·워치리스트 시세·종목 클릭
- [ ] `/stock` overview·랭킹·테이블
- [ ] `/stock/:code` 차트·뉴스·인물 타임라인·`?newsId=` 강조
- [ ] `/person` 트래커·상세·`?statementId=`·맨 위로

### 뉴스

- [ ] `/news` 피드·관심 탭·사이드바
- [ ] older/newer·맨 위로·session 복원·`?newsId=` 포커스
- [ ] 북마크 ☆ ON/OFF·컨텍스트 유지

### 마이페이지

- [ ] `/mypage` 관심종목 — 테이블·imageUrl·뉴스 섹션 없음
- [ ] `?tab=news` 북마크 날짜/종목 뷰
- [ ] `?tab=account` 계정 정보·구분선·알림 토글 저장
- [ ] 사이드 탭: 선택 `primary-on-surface`·hover ring·탭 전환 시 nav 위치 고정

### 검색

- [ ] `P` / `/` 검색 모달·종목·뉴스·인물 결과 라우팅

---

## 범위 밖 / 알려진 이슈

- 루트 `images/` (미추적) — `public/images`와 중복 가능; PR에 포함 여부 팀 합의 필요
- `.cursor/rules` — 로컬 전용(gitignore); 규칙은 `marketlens.mdc`에 수동 반영됨
- 마이페이지 북마크 API 1차 연동 — UI 후속 항목은 [bookmark-tabs changelog](./changelog/2026-05-27-feat-mypage-bookmark-tabs.md) 참고

---

## 연관 항목

- Changelog 인덱스: [docs/changelog/2026-05.md](./changelog/2026-05.md)
- 제품 UI 개요: [docs/design/ui-product-overview.md](./design/ui-product-overview.md)
- 이전 PR: #10 design-tokens · #11 auth · #12 core-pages
