# Change Log — 2026-05-29 · fix: 미등록 URL 404 페이지

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/home-onboarding` |
| 작업일 | 2026-05-29 |
| 커밋 | `405ac78` |

## 요약

라우터에 등록되지 않은 경로(예: `/no-such-page`) 접속 시 React Router 기본 에러 화면 대신, API 404와 동일한 **`AppErrorPage` 404 프리셋**을 보여 주도록 catch-all 라우트를 추가했다.

## Changed

| 파일 | 내용 |
|------|------|
| `pages/NotFoundPage.tsx` | `ERROR_PAGE_PRESETS['404']` 풀스크린 |
| `router/index.tsx` | `{ path: '*', element: <NotFoundPage /> }` (children 맨 끝) |

## 배경

- `AppErrorPage` 404는 기존에 **API HTTP 404**·`/dev/errors/404` 미리보기에서만 사용.
- **클라이언트 라우트 404**용 `path: '*'` 가 없어 `Unexpected Application Error!` 가 노출됨.

## 확인

- [ ] `/no-such-page` — 「페이지를 찾을 수 없습니다」 풀스크린 404
- [ ] 홈으로 CTA 동작
- [ ] `/`, `/stock` 등 기존 라우트 정상
