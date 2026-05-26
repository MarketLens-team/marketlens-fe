# Prompt experiments — 프롬프트 전략 실험

**버그 기록이 아닙니다.** 동일 맥락에서 사용자가 던진 질문(프롬프트)이 에이전트의 **탐색 공간**과 **사용자-facing 답변 도달**에 어떤 차이를 냈는지 남깁니다.

기술 결론·실측은 [issues/](../issues/) 에만 쌓습니다.

## `issues/` 와 구분

| 폴더 | 담는 것 |
|------|---------|
| [issues/](../issues/) | 증상, 실측, 원인, 수정 범위 (**제품·코드**) |
| **prompt-experiments/** (여기) | **어떤 질문 방식**이 **어떤 조사·답변 결과**를 만들었는지 |

## 파일명

`YYYY-MM-DD-{주제-slug}.md`

## 문서 템플릿

```md
# Prompt Experiment — {제목}

| 항목 | 내용 |
|------|------|
| 날짜 | YYYY-MM-DD |
| 관련 이슈 | [issues/…](../issues/…) |

## Goal
무엇을 비교하려는가

## Experiment conditions
- 동일 버그/맥락, 환경, 입력 차이, 질문 순서

## Prompt A
(사용자 원문)

### Exploration scope (추정)
…

### Result A
…

## Prompt B
…

### Result B
…

## Difference
A vs B

## Reusable insight
재사용 패턴 1~3개

## References
issues / changelog 링크
```

## 인덱스

| 날짜 | 제목 | 관련 이슈 |
|------|------|-----------|
| 2026-05-26 | [종목 뉴스 — 탐색 범위 vs 컨펌 후 조사](./2026-05-26-stock-news-pagination-scope.md) | [issues/2026-05-26-stock-news-pagination.md](../issues/2026-05-26-stock-news-pagination.md) |
