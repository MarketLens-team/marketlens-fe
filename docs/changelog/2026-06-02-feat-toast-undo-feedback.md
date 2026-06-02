# feat/toast-dev-and-live-integration (2026-06-02)

## 변경 내용

- `Snackbar`를 검색 모달 아이템 필드 톤으로 맞추고, 상단 스트립을 가리지 않도록 우측 상단 오프셋으로 재배치했다.
- 뉴스/종목 저장·취소 피드백을 실사용 화면에 연결하고, 취소 토스트에서 `되돌리기` 액션을 제공했다.
- `되돌리기` 직후 결과 피드백(`다시 저장되었습니다`)을 추가해 사용자 액션 완료를 명확히 알리도록 했다.
- 마이페이지 종목/뉴스 삭제는 Undo 유예 후 API를 호출하는 지연 커밋 방식으로 전환했다.
- 마이페이지에서 `되돌리기` 클릭 시 낙관적 숨김 상태를 즉시 복원하도록 `useOptimisticRemove` 복구 제어를 추가했다.

## 영향 범위

- 토스트 UI: `Snackbar`, `DevActionButtonPage`
- 저장/취소 피드백: `NewsFeedPage`, `StockDetailContent`, `StockOverviewTable`, `TopNavSearchModal`
- 마이페이지 삭제/복원: `MyPage`, `MyPageWatchlistTable`, `MyPageBookmarkSection`, `useOptimisticRemove`

## 확인 포인트

- 뉴스 저장 취소 후 `되돌리기` 클릭 시 즉시 복원되고, `뉴스가 다시 저장되었습니다.` 토스트가 노출된다.
- 종목 저장 취소 후 `되돌리기` 클릭 시 즉시 복원되고, `종목이 다시 저장되었습니다.` 토스트가 노출된다.
- 마이페이지에서 삭제 후 `되돌리기`를 누르면 새로고침 없이 항목이 즉시 다시 보인다.
