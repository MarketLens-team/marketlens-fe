# Change Log — 2026-06-01 · style: 인물 페이지 여백·모서리

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `style/person-page-border-spacing` |
| 작업일 | 2026-06-01 |

## 요약

인물 트래커·상세의 본문 래퍼에 좌우 `padding-inline`을 추가하고, 3열 그리드 `column-gap`을 키워 중앙 피드와 사이드 카드 사이 여백을 확보했다. 좌·우 사이드 패널 `Card`의 `border-radius`는 `--radius-lg`로 올렸다.

## Changed

| 파일 | 내용 |
|------|------|
| `src/pages/PersonTrackerPage.module.css` | `.page`에 `padding-inline: var(--space-4)` |
| `src/pages/PersonDetailPage.module.css` | 트래커와 동일 `.page` 여백 |
| `src/components/person/PersonTop5Panel.module.css` | 사이드 카드 `border-radius: var(--radius-lg)` |
| `src/components/person/PersonFrequentStocksPanel.module.css` | 동일 radius 오버라이드 |
| `src/pages/personPageLayout.module.css` | `.mainGrid` `column-gap` `space-8` (1100px 이하 `space-5`) |

## 확인

- [ ] `/person` 좌·우 카드 모서리가 12px로 보임
- [ ] `/person` 본문이 화면 양끝 대비 약 16px 안쪽으로 들어감
- [ ] 중앙 피드와 좌·우 카드 사이에 눈에 띄는 간격(32px)이 있음
- [ ] `/person/:id` 트래커와 동일 여백·radius
- [ ] 900px 이하 1열 스택 레이아웃 정상
