# Change Log — 2026-06-04 · fix · 비밀번호 변경 모달 z-index

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage?tab=account` · 비밀번호 변경 모달 |

## 요약

비밀번호 변경 모달이 OTP 모달·네비게이션 아래로 가려지는 문제를 stacked overlay z-index 토큰으로 맞췄다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 모달 z-index | 기본 overlay 값 | `--z-index-overlay-stacked` |

## 파일

- `src/components/mypage/MyPagePasswordChangeModal.module.css`

## 확인

- OTP 인증 모달 위에 새 비밀번호 입력 모달이 정상 표시
