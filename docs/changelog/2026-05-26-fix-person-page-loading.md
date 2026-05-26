# Change Log — 2026-05-26 · fix/person-page-loading

인물 발언(`/person`)·상세(`/person/:id`) 초기 로딩 UX 정리. 스켈레톤 실험 후 **레이아웃 불일치**가 남아, 네이버 뉴스처럼 **준비될 때까지 빈 화면 → 본문 한 번에 표시(툭)** 로 확정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |

## 배경

- 피드만 먼저 오면 사이드가 빈 Card로 잠깐 보이거나, 스켈레톤 그리드와 본문 그리드를 **교체 mount** 하며 3열 폭이 달라 보임.
- 축소된 스켈레톤 박스를 키워도 실제 Card·타임라인과 1:1 맞추기 어렵다는 판단.

## 결정

| 항목 | 내용 |
|------|------|
| 초기 로딩 UI | 페이지 스켈레톤 **없음** (로딩 문구도 없음) |
| 표시 시점 | 피드 + TOP5 + 연관 종목 (+ 상세: 언급 건수) **전부** 준비 후 `pageReady` |
| 재진입 | TopNav 「인물 발언」hover 시 `prefetchPersonTracker` (TTL 60s) |
| 기간 토글 | `keepPreviousData` + 패널 `dim`만 (스켈레톤 없음) |

## 변경 파일

| 파일 | 내용 |
|------|------|
| `lib/personPageLoading.ts` | `isPersonTrackerPageLoading` · `isPersonDetailPageLoading` |
| `lib/personTrackerPrefetch.ts` | 3 API 병렬 prefetch·캐시 peek/set |
| `hooks/useAsyncData.ts` | `initialData` — prefetch 히트 시 첫 페인트 스킵 |
| `hooks/usePersonTracker.ts` 등 | 캐시 연동 |
| `TopNavMenu.tsx` | `/person` hover prefetch |
| `PersonTrackerPage.tsx` · `PersonDetailPage.tsx` | `pageReady`까지 본문 미렌더, 상세는 브레드크럼도 동시 표시 |
| `personPageLayout.module.css` · `PersonDetailPage.module.css` | 그리드 `width: 100%` |

## 확인

- [ ] `/person` 첫 진입: 빈 본문 → 3열 동시 표시 (중간에 축소 스켈레톤 없음)
- [ ] 「인물 발언」hover 후 클릭: 대기 짧아짐 (prefetch)
- [ ] `/person/:id` 상세: 브레드크럼·3열 동시 표시
- [ ] 사이드 「오늘/7일」 토글: 이전 데이터 dim, 전체 스켈레톤 없음
