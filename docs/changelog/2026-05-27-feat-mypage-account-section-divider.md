# Change Log — 2026-05-27 · feat · 마이페이지 계정 탭 섹션 구분선

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | feat/design-refresh |
| 화면 | `/mypage?tab=account` |

## 요약

계정 정보와 알림 설정 사이에 가로 구분선을 추가했다. 초기 `--color-border-default` 1px은 배경과 대비가 낮아 거의 보이지 않아 `--color-border-strong`으로 조정했다.

## Changed

| 항목 | 내용 |
|------|------|
| `MyPage.tsx` | `<hr className={styles.sectionDivider} />` (계정 정보 ↔ 알림 설정) |
| `MyPage.module.css` | `.sectionDivider` — `border-top: 1px solid var(--color-border-strong)`, `margin: space-6` 0 |
| `tabPanelSections` | `gap: 0` (구분선 margin으로 간격) |
| `tokens.css` | `--color-primary-on-surface` mix 88% → **84%** (선택 탭·토글 체감 미세 조정) |

## 확인

- 계정 설정 탭에서 계정 정보 블록 아래 가로선이 보이는지
- 알림 설정·토글 동작 변화 없음
