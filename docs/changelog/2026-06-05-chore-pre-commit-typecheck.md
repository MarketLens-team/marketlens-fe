# Change Log — 2026-06-05 · chore · pre-commit TypeScript 타입 검사

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 커밋 | `2f11353` |

## 요약

pre-commit이 `eslint`만 돌려 `tsc` 오류가 CI `build`까지 넘어가던 간극을 줄이기 위해 `npm run typecheck`(`tsc -b`)를 husky 훅에 추가했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `.husky/pre-commit` | `npm run lint:js` | `lint:js` → `typecheck` 순서 실행 |
| `package.json` scripts | — | `typecheck`: `tsc -b` |

## 파일

- `.husky/pre-commit`
- `package.json`

## 확인

- [ ] `git commit` 시 eslint·typecheck 모두 통과
- [ ] 머지 전 `npm run build`는 여전히 수동·CI에서 수행 (vite 번들 단계)
