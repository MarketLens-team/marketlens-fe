# Change Log - 2026-06-02 · style: 전체 뉴스 좌측 간격·탭 버튼 톤 정리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/all-news-ui-polish` |
| 작업일 | 2026-06-02 |

## 요약

전체 뉴스 페이지에서 좌측 `오늘 뉴스` 카드와 메인 피드 사이 간격을 넓혔다.  
상단 `전체 뉴스 / 관심종목 뉴스` 버튼은 segmented 톤으로 정리해 배경 대비와 활성 상태 구분을 개선했다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/NewsFeedPage.module.css` | 3열 그리드 `column-gap` 확대 (`space-4`→`space-8`, 1100px 이하 `space-3`→`space-5`) |
| `src/components/news/NewsFeedModeTabs.module.css` | 탭 그룹 컨테이너/버튼 스타일 개선, hover·focus·active 상태 분리 |
| `docs/changelog/2026-06.md` | 6월 인덱스 항목 추가 |

## 확인

- [ ] `/news`에서 좌측 카드와 메인 목록 간격이 더 넓어짐
- [ ] 탭 버튼이 동일 높이/여백으로 정렬되고 active 상태가 명확함
- [ ] 키보드 포커스 시 탭 focus ring이 정상 표시됨
