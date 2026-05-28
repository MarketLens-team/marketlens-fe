# Change Log — 2026-05-29 · fix/auth-proactive-token-refresh

## 메타
| 브랜치   | fix/auth-proactive-token-refresh |
| 작업일   | 2026-05-29                       |
| 관련 PR  | -                                |
| 커밋     | 89ed2b4                          |

## 요약

`ensureAccessToken()`이 access token의 **만료 임박 여부를 검사하지 않아** 토큰이 만료된 직후
401 → 재발급 → 재시도 1-RTT 지연이 발생하던 문제를 수정.
JWT `exp` 클레임을 파싱해 만료까지 60 초 이하이면 선제 재발급하도록 변경.

---

## Fixed

### `src/services/authTokenRefresh.ts`

**근본 원인**
```ts
// before: token이 있으면 만료 여부 무관하게 true 반환
if (hasAccessToken()) return true
```
토큰이 만료 직전·직후에도 `hasAccessToken()`이 `true`를 반환해 API 요청이 만료된 토큰으로
나가고, 서버가 401을 응답한 뒤 response interceptor가 재발급 → 재시도하는 왕복이 발생했음.

**수정 내용**

| 추가 함수 | 역할 |
|-----------|------|
| `getTokenExp(token)` | JWT payload의 `exp` 클레임(Unix 초)을 `atob` + `JSON.parse`로 파싱. 파싱 실패 시 `null` 반환 |
| `isTokenNearExpiry()` | 토큰이 없거나, exp 파싱 불가, 또는 만료까지 `PROACTIVE_REFRESH_THRESHOLD_S`(60 s) 이하이면 `true` |

```ts
// after: 만료 임박 여부까지 검사
if (!isTokenNearExpiry()) return true
```

`PROACTIVE_REFRESH_THRESHOLD_S = 60` — 만료 60 초 전부터 재발급 시도.
이미 in-flight 재발급이 있으면 `refreshInFlight` 에 합류해 중복 요청은 발생하지 않음.

## Notes
- `atob()`은 브라우저 내장 함수이므로 별도 의존성 없음
- JWT signature 검증은 하지 않음 (서버가 최종 권한 — 만료 판단만 선제 수행)
- 역직렬화 실패(손상된 토큰 등)는 `isTokenNearExpiry() → true`로 처리해 항상 재발급 시도
