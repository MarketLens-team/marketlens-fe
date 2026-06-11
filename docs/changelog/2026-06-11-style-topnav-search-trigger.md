# Change Log — 2026-06-11 · style · 상단 검색 트리거 안내

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | GNB 우측 검색 버튼 (`TopNavActions`) |

## 요약

검색 진입점이 무엇인지 바로 알 수 있도록 돋보기 아이콘과 `/` 단축키 안내 문구를 넣었다. 우측 `kbd` 박스는 제거했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 라벨 | `검색` + 우측 `/` 뱃지 박스 | 돋보기 아이콘 + **「/ 를 눌러 검색하세요」** |
| `/` 표시 | 테두리·배경 있는 `kbd` | 문구 안 일반 텍스트 |
| 접근성 | `aria-keyshortcuts="/"`만 | `aria-label="/ 키로 검색 열기"` 추가 |

## 파일

- `src/components/common/TopNavActions.tsx`
- `src/components/common/TopNavActions.module.css`

## 확인

- [ ] GNB 검색 버튼 — 좌측 돋보기 + 안내 문구
- [ ] `/` 키·클릭으로 검색 모달 열림
- [ ] 좁은 화면(≤920px)에서 문구 한 줄 유지
