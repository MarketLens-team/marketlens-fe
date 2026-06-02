import { useRef, useState } from 'react'

const REMOVE_ANIM_MS = 150

/**
 * 낙관적 삭제 훅
 *
 * 아이템 삭제 시 API 완료를 기다리지 않고 즉시 UI에서 제거.
 * CSS: components/common/optimisticRemove.module.css (.item / .itemRemoving)
 * 설계: docs/design/optimistic-remove-animation.md
 *
 * @example
 * const { visibleItems, handleRemove, animatingId } = useOptimisticRemove(items, onRemove)
 *
 * <li className={clsx(remove.item, animatingId === item.id && remove.itemRemoving)}>
 *   <button onClick={() => handleRemove(item.id)}>×</button>
 * </li>
 */
export function useOptimisticRemove<T extends { id: string }>(
  items: T[],
  onRemove: (id: string, controls: { restore: () => void }) => void,
) {
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const removeTimersRef = useRef<Map<string, number>>(new Map())

  const handleRemove = (id: string) => {
    const restore = () => {
      const timerId = removeTimersRef.current.get(id)
      if (timerId != null) {
        window.clearTimeout(timerId)
        removeTimersRef.current.delete(id)
      }
      setHiddenIds((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setAnimatingId((prev) => (prev === id ? null : prev))
    }

    setAnimatingId(id)
    onRemove(id, { restore }) // fire-and-forget
    const timerId = window.setTimeout(() => {
      setHiddenIds((prev) => new Set(prev).add(id))
      setAnimatingId(null)
      removeTimersRef.current.delete(id)
    }, REMOVE_ANIM_MS)
    removeTimersRef.current.set(id, timerId)
  }

  const visibleItems = items.filter((item) => !hiddenIds.has(item.id))

  return { visibleItems, handleRemove, animatingId }
}
