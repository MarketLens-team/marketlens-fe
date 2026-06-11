# Change Log — 2026-06-11 · style · 뉴스 피드 전체/관심 탭 언더라인 통일

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 전체 뉴스 `/news` — 전체 뉴스 / 관심종목 뉴스 탭 |
| 선행 | GNB·검색 모달 `UnderlineTabNav` 패턴 |

## 요약

pill 형태 탭을 공통 `UnderlineTabNav`로 교체해 GNB와 시각 언어를 맞췄다. 뉴스 피드는 `variant="text"`로 호버 슬라이딩 인디케이터는 빼고, 선택 탭만 파란색·볼드·하단 언더라인으로 표시한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 탭 형태 | pill 버튼 (테두리·배경) | 언더라인 탭 스트립 + 하단 구분선 |
| 선택 탭 | pill 강조 배경 | primary 색 + 볼드 + 2px 언더라인 |
| 호버 | pill ring·테두리 | 텍스트 색만 밝아짐 (슬라이딩 언더라인 없음) |
| 공통 컴포넌트 | `NewsFeedModeTabs` 자체 버튼 | `UnderlineTabNav` `text` 변형 재사용 |

## 파일

- `src/components/news/NewsFeedModeTabs.tsx`
- `src/components/news/NewsFeedModeTabs.module.css`
- `src/components/common/UnderlineTabNav.tsx` — `variant: 'underline' \| 'text'`
- `src/components/common/UnderlineTabNav.module.css`
- `src/pages/NewsFeedPage.module.css` — 사이드바·탭 정렬

## 확인

- [ ] `/news` — 선택 탭: 파란색·볼드·언더라인
- [ ] `/news` — 비선택 탭 호버: 색만 변경, 언더라인 슬라이드 없음
- [ ] `/news` — 좌측 「오늘 뉴스」와 피드 시작선 정렬
- [ ] 검색 모달 탭 — 기존 호버·활성 언더라인 동작 유지 (`underline` 기본값)
