# Change Log — 2026-06-05 · fix · 대시보드 stockAlert scope 타입 오류

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 커밋 | `ab10667` |

## 요약

`stockAlert()` 리팩터로 `scope`를 3번째 인자로 분리한 뒤 input `Omit` 타입에 `scope`가 남아 CI `tsc -b`가 실패하던 문제를 수정했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `stockAlert` input 타입 | `scope`가 input에 필수로 남음 | `Omit`에 `'scope'` 추가, 3번째 인자로만 전달 |

## 파일

- `src/components/dashboard/pickDashboardAlerts.ts`

## 확인

- [ ] `npm run build` (`tsc -b`) 통과
- [ ] 비로그인·로그인 홈 이상치 카드 정상 렌더
