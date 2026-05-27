# Issues (미해결·조사 중)

changelog는 **끝난 작업**, DDR은 **설계 결정**, 이 폴더는 **제품·코드 쪽 미해결 문제**만 둡니다.

**프롬프트 전략 실험**(질문 방식이 조사·답변에 미친 영향)은 [docs/prompt-experiments/](../prompt-experiments/) 를 씁니다.

## 언제 무엇을 쓰나

| 상황 | 저장 위치 |
|------|-----------|
| 버그·이상 동작 **조사 중** | `docs/issues/YYYY-MM-DD-slug.md` |
| 질문 방식·프롬프트 실험 | [docs/prompt-experiments/](../prompt-experiments/) |
| 원인 확정·PR | GitHub Issue + 이슈 md에 `#번호` |
| **수정 완료** | `docs/changelog/YYYY-MM-DD-fix-*.md` + 이슈 md `fixed` |

**fix용 MD는 issues에 두지 않습니다.** 머지 후 changelog `fix` 한 곳 + 이슈 md §해결 링크.

## issues 파일 템플릿

```md
# 제목

| 항목 | 내용 |
| 상태 | investigating \| confirmed \| fixed |
| 관련 실험 | ../prompt-experiments/YYYY-MM-DD-….md (선택) |

## 1. 증상
## 2. 실측 / 조사
## 3. 원인 후보
## 4. 컨펌 필요
## 5. 수정 범위
## 6. 후속 액션
## 7. 해결 (fixed 시만)
```

## 인덱스

| 날짜 | 제목 | Prompt experiment | 상태 |
|------|------|-------------------|------|
| 2026-05-27 | [마이페이지 프로필 사이드 nav 위치](./2026-05-27-mypage-profile-sidenav-position.md) | [sticky vs fixed](../prompt-experiments/2026-05-27-mypage-sidenav-fixed-vs-sticky.md) | fixed → [fix changelog](../changelog/2026-05-27-fix-mypage-profile-sidenav-position.md) |
| 2026-05-26 | [종목 뉴스 — 긍정/부정·무한 스크롤](./2026-05-26-stock-news-pagination.md) | [탐색 범위 vs 컨펌 후](../prompt-experiments/2026-05-26-stock-news-pagination-scope.md) | fixed → [fix changelog](../changelog/2026-05-26-fix-stock-news-pagination.md) |

## changelog 월 인덱스

`docs/changelog/YYYY-MM.md` 하단 “조사 중”에 **이슈 md만** 링크.  
prompt-experiments·미해결 상세는 changelog 본문에 길게 쓰지 않음.
