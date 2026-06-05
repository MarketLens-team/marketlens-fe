# Change Log — 2026-06-05 · style · 마이페이지 알림 종류 문구 정리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-alert-channel-settings` |
| 화면 | `/mypage?tab=account` — `MyPageAlertSettings` · 회원가입 알림 단계 |

## 요약

알림 종류 UI에서 **관심 인물 발언** 항목을 제거하고, **일간 요약** 발송 시각 안내를 오전 8시 → **9시**로 수정했다. (`personMentionEnabled` API 필드는 유지, UI 토글만 미노출)

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 알림 종류 목록 | 4종 (인물 발언 포함) | 3종 — 인물 발언 **제거** |
| 일간 요약 설명 | 매일 오전 **8**시 | 매일 오전 **9**시 |
| 회원가입 알림 단계 | 인물 발언 체크박스 포함 | 동일하게 3종·9시 문구 |

## 파일

- `src/components/mypage/MyPageAlertSettings.tsx`
- `src/components/auth/SignupAlertsStep.tsx`

## 확인

- 계정 설정 → 알림 설정: 언급량 급등 / 감성 점수 급변 / 일간 요약 3토글만 표시
- 일간 요약 설명에 「오전 9시」 표기
