# Change Log — 2026-05-26 · feat/design-refresh (인물 포커스·종목 타임라인·네비)

브랜치 `feat/design-refresh`에서 진행한 **인물 발언 `statementId` 포커스**, **종목 상세 인물 타임라인 UI·API 전환**, **상단 네비 정리**, **mock 순환 import·에러 메시지** 작업 기록입니다.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 (FE) | `feat/design-refresh` |
| 작업일 | 2026-05-24 ~ 2026-05-26 |
| 선행 문서 | [인물 타임라인 (5/23)](./2026-05-23-feat-design-refresh-person-timeline.md) · [종목 상세 (5/21)](./2026-05-21-feat-design-refresh-stock-detail.md) · [검색 모달](./2026-05-21-feat-design-refresh-search-modal.md) |
| OpenAPI | `getRelatedPersonStatements` — `GET /api/v1/stocks/{code}/related-person-statements` |

### 프론트 커밋 (`feat/design-refresh`)

| 해시 | 요약 |
|------|------|
| `82cc87c` | 인물 트래커 발언 클릭 → 상세 `statementId` 스크롤·초록 강조 |
| `86208a6` | 상단 네비에서 관심 목록 메뉴 제거 |
| `ead8ffd` | 종목 상세 인물 타임라인 세로축·구분선 제거 |
| `a9a3490` | rail 레이아웃·`related-person-statements` API 연동 |
| `018d509` | mock 순환 import 수정·클라이언트 에러 메시지 sanitize |

---

## 요약

1. **발언 포커스** — 트래커·검색·종목 상세에서 `/person/:id?statementId=` 진입 시 해당 발언 **스크롤 + 초록 본문** ([5/23 changelog §발언 포커스](./2026-05-23-feat-design-refresh-person-timeline.md#2026-05-24--발언-포커스-statementid), `82cc87c`).
2. **상단 네비** — `TopNavWatchlistMenu` 제거, 검색·로그인/설정만 노출 (`86208a6`). 종목 상세·마이페이지 관심 기능은 유지.
3. **종목 상세 인물 타임라인** — 좌측 `personTimelineRail`(아바타 → 시간 `13px` 가운데) · 우측 본문, 항목 `border` 제거, **시간 아래** 세로축 연결 (`ead8ffd`, `a9a3490`).
4. **API 전환** — 커서 다회 호출(`fetchPersonStatementsForStockDetail`) → **`GET …/related-person-statements?limit=5`**, 응답 `PersonStatementResponse[]` 재사용 (`a9a3490`).
5. **안정성** — `stockClient`↔`personClient` 순환 import로 mock 시 `ReferenceError` → mock은 `mockPersonStatementsResponse` 직접 필터; `PageFetchError`에 개발자 문구 노출 방지 (`018d509`).

---

## Changed

### 인물 발언 포커스 (`82cc87c`)

- `PersonStatementCard` (`variant="full"`): `buildPersonDetailPath(personId, { statementId })`
- `usePersonStatementFocus`: `[data-scroll-root]` 스크롤·`loadMore` 자동 호출·포커스 해제
- 상세: `PersonDetailPage` / 트래커: `PersonTrackerPage`에 훅 연동

---

### 상단 네비 (`86208a6`)

| 파일 | 내용 |
|------|------|
| `src/components/common/TopNavActions.tsx` | `TopNavWatchlistMenu` 제거 |

- `/watchlist` 라우트·종목 상세 관심 토글·마이페이지 테이블은 **변경 없음**.

---

### 종목 상세 · 인물 타임라인 UI (`ead8ffd`, `a9a3490`)

#### `StockDetailContent.tsx` · `.module.css`

```text
personTimelineItemLink
├── personTimelineRail     ← flex column, 4rem, 카드 배경
│   ├── EntityAvatar (md)
│   └── personTimelineTime (base 13px, center)
└── personTimelineBody
    ├── personTimelineHeadline  (호버 primary)
    └── personTimelineMeta
```

| 스타일 | 동작 |
|--------|------|
| `.peopleTimelineItem::before` | rail 헤더(아바타+시간) **아래**부터 다음 항목 padding 구간까지 세로선 |
| `.peopleTimelineItem:not(:first-child)::after` | 항목 사이 padding-top만 연결(시간·아바타 침범 없음) |
| `.peopleTimelineItem` | `border-bottom` 제거, `padding` 간격 |

- 링크: `buildPersonDetailPath` + `statementId` → 인물 상세 포커스와 동일.

---

### API · 클라이언트 (`a9a3490`, `018d509`)

| API | 용도 |
|-----|------|
| `GET /api/v1/stocks/{code}/related-person-statements?limit=5` | 종목 연관 인물 발언 최신순 (기본 5건) |
| ~~`GET /api/v1/persons/mentions/cursor`~~ (다회) | ~~`fetchPersonStatementsForStockDetail`~~ → **deprecated**, mock만 잔존 |

| 파일 | 내용 |
|------|------|
| `src/data/clients/stockClient.ts` | `fetchStockRelatedPersonStatements`, `fetchStockDetail`에서 호출 |
| `src/data/mappers/stockMapper.ts` | `mapStockPeopleTimeline` 기본 limit **5** |
| `src/lib/personStatementStockMatch.ts` | `personStatementRelatesToStock` (순환 import 분리) |
| `src/lib/sanitizeClientErrorMessage.ts` | `is not defined` 등 → `C003` 사용자 문구 |
| `src/data/errorPagePresets.ts` | `appErrorPresetFromMessage`에 sanitize 적용 |

#### mock

```typescript
mockPersonStatementsResponse
  .filter((row) => personStatementRelatesToStock(row, code))
  .slice(0, limit)
```

- `VITE_USE_MOCK_DATA=false` → 실 API `related-person-statements` 사용.

---

## QA 체크리스트

- [ ] **종목 상세**: 인물 타임라인 세로선·시간 라벨 정렬·구분선 없음
- [ ] **종목 상세**: 발언 클릭 → 인물 상세 스크롤·초록 강조
- [ ] **API**: `related-person-statements` 5건 이하·빈 목록 EmptyState
- [ ] **mock(dev)**: 종목 상세 진입 시 ReferenceError 없음
- [ ] **에러**: fetch 실패 시 기술 문구 대신 사용자 메시지
- [ ] **네비**: 상단에 관심 목록 없음, 검색·프로필 정상

---

## Notes

- `TopNavWatchlistMenu` 컴포넌트·`/watchlist` 페이지 파일은 repo에 남아 있음(미노출).
- `fetchPersonStatementsForStockDetail`은 `personClient`에 `@deprecated` — mock·레거시 참고용만.
