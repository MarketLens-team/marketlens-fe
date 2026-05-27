# Change Log — 2026-05-26 · docs (issues · prompt-experiments)

버그 조사·AI 협업 실험·changelog 역할을 나누고, 에이전트가 참고할 문서 맵을 맞춘 기록.

## 메타

| 항목 | 내용 |
|------|------|
| 작업일 | 2026-05-26 |
| FE 커밋 (문서·코드 동반) | `ddd80ec` |
| 선행 | 종목 뉴스 페이지네이션 조사 채팅 |

## 왜 나눴나

| 이전 | 이후 |
|------|------|
| changelog에 조사·회고가 섞이기 쉬움 | **issues** = 제품·코드 사실·실측·수정 상태 |
| QA/채팅 전사는 에이전트 일지처럼 비대 | **prompt-experiments** = 같은 버그에 대한 **질문(프롬프트) 전략** 비교 |
| fix 본문 위치 불명확 | fix는 **`changelog/YYYY-MM-DD-fix-*.md`만**, issues는 §해결 링크 |

## Added

| 경로 | 용도 |
|------|------|
| `docs/issues/README.md` | 조사 중 이슈 인덱스·템플릿 |
| `docs/issues/2026-05-26-stock-news-pagination.md` | 종목 뉴스 무한 스크롤 (→ fix 후 `fixed`) |
| `docs/prompt-experiments/README.md` | 실험 템플릿·인덱스 |
| `docs/prompt-experiments/2026-05-26-stock-news-pagination-scope.md` | 탐색 범위 vs 컨펌 후 조사 (Prompt A/B) |

## Changed

| 경로 | 내용 |
|------|------|
| `docs/README.md` | issues · prompt-experiments 문서 맵 |
| `docs/changelog/2026-05.md` | 「조사 중」→ fix/docs 항목 링크 |
| `.cursor/rules/workflow.mdc` | 위 폴더와 동일 표·협업 프롬프트 안내 (**로컬만**, `.cursor/`는 gitignore) |

## Notes (에이전트·협업)

- **prompt = 탐색 공간 제어**: changelog/git 앵커 + 「컨펌 후」가 사용자-facing 답변 도달에 유리 ([실험 문서](../prompt-experiments/2026-05-26-stock-news-pagination-scope.md))
- 새 실험: `docs/prompt-experiments/YYYY-MM-DD-{slug}.md` + README 인덱스 한 줄
- `.cursor/rules/workflow.mdc` 변경 시 **본 changelog에 한 줄** 남기고, 팀원 로컬 rules 동기화
