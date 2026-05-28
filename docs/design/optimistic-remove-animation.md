# 낙관적 삭제 애니메이션

**패턴 파일:** `src/components/common/optimisticRemove.module.css`

---

## 목표

리스트 아이템(북마크, 관심종목 등)을 삭제할 때 API 응답을 기다리지 않고 UI를 즉시 업데이트한다.
사용자는 삭제가 "즉각" 반응한다고 느끼고, 네트워크 지연이 화면에 노출되지 않는다.

---

## 동작 흐름

```
X 클릭
  └─ setAnimatingId(id)          → .itemRemoving 적용 (opacity 0, 150ms)
  └─ onRemove(id)                → API fire-and-forget (await 없음)

150ms 후
  └─ hiddenIds에 추가            → visibleItems 필터링 → DOM 즉시 제거
  └─ setAnimatingId(null)
```

아이템이 투명해진 뒤 DOM에서 제거되므로, 높이 collapse 점프가 사용자에게 보이지 않는다.

---

## 왜 opacity만 쓰는가

| 방법 | 성능 | 결과 |
|------|------|------|
| `grid-template-rows: 1fr → 0fr` | 매 프레임 reflow | 버벅임 |
| `height: auto → 0` | 매 프레임 reflow | 버벅임 |
| **`opacity: 0` → DOM 제거** | GPU 가속, reflow 없음 | 부드러움 ✅ |

`opacity`는 컴포지터 레이어에서만 처리되어 메인 스레드 reflow를 유발하지 않는다.
아이템이 투명해진 직후 DOM에서 제거되므로 남는 공백 문제가 없다.

---

## 적용 대상

| 화면 | 컴포넌트 | 상태 |
|------|----------|------|
| 마이페이지 > 저장 뉴스 | `MyPageBookmarkSection` | ✅ 적용 |
| 마이페이지 > 관심종목 | `MyPageWatchlistTable` | 예정 |

---

## 구현 템플릿

```tsx
const REMOVE_ANIM_MS = 150

function ItemList({ items, onRemove }) {
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const handleRemove = (id: string) => {
    setAnimatingId(id)
    onRemove(id) // fire-and-forget
    window.setTimeout(() => {
      setHiddenIds((prev) => new Set(prev).add(id))
      setAnimatingId(null)
    }, REMOVE_ANIM_MS)
  }

  const visibleItems = items.filter((item) => !hiddenIds.has(item.id))

  return (
    <ul>
      {visibleItems.map((item) => (
        <li
          key={item.id}
          className={clsx(remove.item, animatingId === item.id && remove.itemRemoving)}
        >
          {/* content */}
          <button onClick={() => handleRemove(item.id)}>×</button>
        </li>
      ))}
    </ul>
  )
}
```

```css
/* CSS는 공통 모듈 사용 */
import remove from '../common/optimisticRemove.module.css'
```
