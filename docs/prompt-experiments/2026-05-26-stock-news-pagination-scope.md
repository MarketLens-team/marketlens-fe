# Prompt Experiment — 종목 뉴스: 탐색 범위 vs 컨펌 후 조사

| 항목 | 내용 |
|------|------|
| 날짜 | 2026-05-26 |
| 세션 | Cursor 채팅 (동일 스레드, 연속 2질문) |
| 관련 이슈 | [issues/2026-05-26-stock-news-pagination.md](../issues/2026-05-26-stock-news-pagination.md) |

## Goal

같은 버그(종목 상세 관련 뉴스 무한 스크롤)에 대해, **열린 질문**과 **탐색 범위·체크포인트를 명시한 질문**이 에이전트 결과에 어떤 차이를 만드는지 비교한다.

## Experiment conditions

- **동일 맥락**: `/stock/005930`, 긍정/부정 분포·뉴스 소량 체감
- **입력**: 질문 1에 종목 상세 스크린샷 첨부
- **순서**: Prompt A → (답 없음) → Prompt B (같은 스레드)
- **기술 결론**은 이 문서가 아니라 [issues](../issues/2026-05-26-stock-news-pagination.md) §2–4 참고

## Prompt A

> 긍정이랑 부정이 커서 페이지네이션 안 되는 원인 좀 분석해봐

(첨부: 종목 상세 스크린샷)

### Exploration scope (추정)

- 제한 없음: 코드·API curl·브라우저·mock/API 분기 등 **가능한 모든 조사**
- 산출 형식·중간 컨펌·수정 범위 **미지정**

### Result A

| 항목 | 결과 |
|------|------|
| 사용자-facing 답변 | **없음** (한국어 정리 답변이 채팅에 올라가기 전에 다음 질문으로 전환) |
| 산출 | tool call 위주 조사만 진행 |
| 코드 수정 | 없음 |
| 컨펌 요청 | 없음 |

## Prompt B

> 아니면 changelog에서 grap을 해서든 뭐든 함 찾아봐  
> 찾고 나서 나한테 컨펌 후 확인

### Exploration scope (추정)

- **1차 앵커**: `changelog` / `git` / 관련 커밋·설계 문서
- **명시적 체크포인트**: 조사 후 **컨펌**, 그다음 확인·수정
- 필요 시 코드·API 실측은 changelog 결과를 보완하는 수준

### Result B

| 항목 | 결과 |
|------|------|
| 사용자-facing 답변 | **있음** — changelog/git 이력, mock vs API 가설, 가설 vs 실측 표, 수정 전 컨펌 체크리스트 |
| 산출 | Prompt A 주제(긍정/부정·페이지네이션)까지 **한 번에 정리** |
| 코드 수정 | 답변 시점 기준 **없음** (의도적으로 컨펌 대기) |
| 컨펌 요청 | 환경·증상 (a)–(d) 선택지 제시 |

답변에 담긴 **기술 요약** (상세는 issues): changelog에 “비율 때문에 API가 막는다”는 기록 없음; mock 4건·`hasNext` 불일치 유력; API `005930` 실측은 커서·`sentiment` 정상; UX는 무한 스크롤만 제공.

## Difference

| 축 | Prompt A | Prompt B |
|----|----------|----------|
| 탐색 공간 | 넓음 (제한 없음) | changelog/git로 **1차 제한** |
| 답변 도달 | 미도달 (조사만) | 도달 (구조화된 답 + 컨펌) |
| 수정 타이밍 | 불명확 | **컨펌 후**로 고정 |
| Prompt A 내용 | — | B 답변에 **흡수** |

핵심 차이는 “무엇이 버그인가”가 아니라 **프롬프트가 탐색 공간과 종료 조건을 어떻게 잡았는가**이다.

## Reusable insight

1. **범위를 명시할수록** 에이전트가 tool call만 반복하기보다 **사용자-facing 답변**에 도달하기 쉽다. (`changelog` / `git` / `grep` 등 앵커 지정)
2. **프롬프트 = 탐색 공간 제어** — “원인 분석해봐”만으로는 넓은 조사에 머물 수 있음.
3. **“컨펌 후 확인/수정”** 같은 중간 체크포인트는 무한 탐색·선제 수정을 줄이고, 환경·증상을 사용자에게 되돌리기 좋다.

## References

- [issues/2026-05-26-stock-news-pagination.md](../issues/2026-05-26-stock-news-pagination.md) — 실측, 원인 후보, 수정 상태
- [changelog/2026-05.md](../changelog/2026-05.md) — 관련 커밋 인덱스

### 후속 (같은 스레드, 실험 범위 밖)

사용자 컨펌: `VITE_USE_MOCK_DATA=false`, 증상 **(a) 스크롤해도 더 안 붙음** → FE `useInfiniteScroll` 센티넬·`rootMargin` 수정. 기술 내용은 issues §6 참고.
