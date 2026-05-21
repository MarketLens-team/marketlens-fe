import { useLayoutEffect, type RefObject } from 'react'
import { getLayoutScrollRoot } from './useInfiniteScroll'

const STOCK_BACK_TO_TOP_SELECTOR = '[data-stock-back-to-top]'
const LIST_TOP_GAP_PX = 8
const MIN_LIST_HEIGHT_PX = 96

/**
 * 맨 위로 버튼 top을 기준으로 타임라인 리스트 max-height를 맞춤 (--people-timeline-max-height).
 */
export function useStockPeopleTimelineScrollMax(
  listRef: RefObject<HTMLUListElement | null>,
  stackRef: RefObject<HTMLDivElement | null>,
): void {
  useLayoutEffect(() => {
    const list = listRef.current
    const stack = stackRef.current
    if (!list || !stack) return

    const sync = () => {
      const listTop = list.getBoundingClientRect().top
      const button = document.querySelector<HTMLElement>(STOCK_BACK_TO_TOP_SELECTOR)
      const anchorTop = button?.getBoundingClientRect().top ?? window.innerHeight - 72
      const maxH = Math.max(MIN_LIST_HEIGHT_PX, Math.floor(anchorTop - listTop - LIST_TOP_GAP_PX))
      stack.style.setProperty('--people-timeline-max-height', `${maxH}px`)
    }

    sync()
    const root = getLayoutScrollRoot()
    root?.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    const ro = new ResizeObserver(sync)
    ro.observe(list)
    ro.observe(stack)

    return () => {
      root?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      ro.disconnect()
      stack.style.removeProperty('--people-timeline-max-height')
    }
  }, [listRef, stackRef])
}
