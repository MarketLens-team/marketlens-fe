# Change Log — 2026-05-20 · feat/core-pages (프론트엔드)

브랜치 `feat/core-pages`에서 진행한 **인물 트래커·에러 UI·공통 fetch 실패 처리** 등 **프론트엔드만** 해당하는 작업 기록입니다.  
(백엔드 API 스펙 변경·인가(403) 등 서버 이슈는 본 문서 범위에서 제외합니다.)

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/core-pages` |
| 작업일 | 2026-05-20 |
| 관련 PR | _(미작성)_ |

## 요약

- **인물 트래커**(`/person`): 기간 토글(오늘·7일)과 API `range` 쿼리(`today` / `weekly`) 연동, 커서 응답의 `topPersons`·`frequentStocks` 반영, 피드 **무한 스크롤**, 우측 전용 스크롤 영역 + **`BackToTopButton`**에 `scrollRootSelector`로 맨 위로 동작 분리.
- **`useAsyncData`**: `factory`가 바뀌어 재요청할 때 **이전 `data`를 비워** 잘못된 캐시 노출을 막음.
- **`AppErrorPage`**: 디자인 토큰(`tokens.css`) 기반으로 스타일 정리, **`layout="embedded"`** / **`layout="fullscreen"`** 분리.
- **`PageFetchError`** + **`httpErrorPage`**: 목록형 페이지 공통 embedded 카드 에러; **401·403·404·5xx·네트워크**는 `/dev/errors/*`와 동일한 **풀스크린** 프리셋으로 조기 반환.
- **페이지 전반**: 기존 `bannerError` 제거 후 `Dashboard`·`Stock`·`Buzz`·`Person`·`My`(초기 로드)·`Admin*`에 적용.

## Added

### 컴포넌트·유틸

| 경로 | 역할 |
|------|------|
| `src/components/common/PageFetchError.tsx` | Layout `main` 안 **embedded** 공통 fetch 실패 UI |
| `src/data/util/httpErrorPage.ts` | Axios / 메시지에서 HTTP 상태 추정, **풀스크린용** `fullscreenPresetFromAppError` |

### 타입·매핑·목 (인물)

- `PersonMentionsRange`, `PersonMentionCursorResponse`의 `topPersons`·`frequentStocks`·`FrequentStockItemResponse`
- `mapPersonTrackerFromCursorResponse`, `mapFrequentStockItem`; `merge` 시 우측 패널은 **첫 응답 유지**
- 목 인물 발언 리스트 확장(무한 스크롤 검증용), 커서 응답에 top/frequent 포함

### `AppErrorPage`

- `AppErrorPageLayout`: `fullscreen` \| `embedded`
- `embedded` 시 제목을 `ERR \| …` 없이 **제목만** 표시

### `BackToTopButton`

- `scrollRootSelector` — Layout `main`이 아닌 **지정 스크롤 루트**(인물 트래커 우측 패널 등) 기준 표시·`scrollTo`

### `errorPagePresets`

- `appErrorPresetFromMessage(message, { title?, variant?, hint?, omitHint? })`

## Changed

- **`personClient`**: `range` 쿼리, 커서 응답 매핑·top 보강(`GET /persons/top` 폴백)
- **`usePersonTracker`**: `range` 인자, `loadMore`에 `range` 전달
- **`PersonTrackerPage`**: 기간 UI, 센티널 무한 스크롤, 우측 sticky·내부 스크롤·`BackToTopButton`
- **`BackToTopButton`**: `scrollRootSelector` 시 해당 요소 기준 표시·`scrollTo`
- **`useAsyncData`**: 재요청 시작 시 `setData(null)`
- **`AppErrorPage.module.css`**: 하드코드 색 제거, 토큰·`color-mix`로 통일; `.pageFullscreen` / `.pageEmbedded` 분리
- **다음 페이지**: 풀스크린 HTTP 에러 시 **Layout 없이** `AppErrorPage`만 반환  
  `DashboardPage`, `StockDetailPage`, `BuzzAlertPage`, `PersonTrackerPage`, `MyPage`, `AdminPage`, `AdminStocksPage`, `AdminCrawlingPage`
- **`DevErrorPagePreview`**: `layout="fullscreen"` 명시

## Removed

- 여러 `*.module.css`의 **`.bannerError`** 블록 (에러 스타일은 `AppErrorPage` 계열로 일원화)

## Notes (프론트 범위 밖)

- 홈 대시보드 API가 **403**을 반환하는 경우는 **서버 인가·토큰·Security 설정** 이슈이며, 위 변경은 그에 맞는 **표시 방식**만 조정한 것입니다.

## 커밋 (시간순, 관련만)

1. `d892c05` — feat(person): 트래커 기간·무한스크롤·우측 스크롤과 range 수정  
2. `daabe30` — feat(ui): AppErrorPage 토큰화·embedded 레이아웃·인물 트래커 연동  
3. `795b25b` — feat(ui): 공통 PageFetchError·HTTP 시 풀스크린 에러  

_(그 이전 `a4a95f7` 등 인물 커서 전환 커밋은 5-19 이후 연속 작업이면 함께 참고.)_

## 확인

```bash
npm run lint
npm run build
```

- [ ] `/person` — 오늘/7일, 무한 스크롤, 우측 스크롤 + 맨 위로
- [ ] API 403 등 — 풀스크린 에러(별·블러 코드) 노출
- [ ] 그 외 fetch 실패 — Layout 안 embedded 카드
- [ ] 기간 변경 시 이전 목록이 잠깐 섞이지 않음 (`useAsyncData`)
