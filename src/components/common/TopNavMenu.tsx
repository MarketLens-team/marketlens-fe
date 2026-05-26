import clsx from 'clsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { prefetchPersonTracker } from '../../lib/personTrackerPrefetch'
import { TOP_MENUS, isTopNavActive } from './topNavMenus'
import styles from './TopNavMenu.module.css'

interface IndicatorPos {
  left: number
  width: number
}

const HIDDEN_POS: IndicatorPos = { left: 0, width: 0 }

export function TopNavMenu() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [hoverLabel, setHoverLabel] = useState<string | null>(null)
  const [hoverIndicator, setHoverIndicator] = useState<IndicatorPos>(HIDDEN_POS)
  const [hoverVisible, setHoverVisible] = useState(false)

  const activeLabel = TOP_MENUS.find((item) => isTopNavActive(pathname, item))?.label ?? null

  const measureItem = useCallback((el: HTMLElement | null): IndicatorPos | null => {
    const nav = navRef.current
    if (!el || !nav) return null
    const navRect = nav.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    return {
      left: rect.left - navRect.left,
      width: rect.width,
    }
  }, [])

  const syncHoverIndicator = useCallback(() => {
    if (!hoverLabel || hoverLabel === activeLabel) {
      setHoverVisible(false)
      return
    }
    const pos = measureItem(itemRefs.current.get(hoverLabel) ?? null)
    if (!pos) {
      setHoverVisible(false)
      return
    }
    setHoverIndicator(pos)
    setHoverVisible(true)
  }, [hoverLabel, activeLabel, measureItem])

  useLayoutEffect(() => {
    syncHoverIndicator()
  }, [syncHoverIndicator, pathname])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const ro = new ResizeObserver(() => syncHoverIndicator())
    ro.observe(nav)

    const onResize = () => syncHoverIndicator()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [syncHoverIndicator])

  const handleNavMouseLeave = () => {
    setHoverLabel(null)
    setHoverVisible(false)
  }

  const handleItemMouseEnter = (label: string, to: string) => {
    setHoverLabel(label)
    if (to === '/person') prefetchPersonTracker()
    if (label === activeLabel) {
      setHoverVisible(false)
      return
    }
    const pos = measureItem(itemRefs.current.get(label) ?? null)
    if (pos) {
      setHoverIndicator(pos)
      setHoverVisible(true)
    }
  }

  return (
    <nav
      ref={navRef}
      className={styles.menu}
      aria-label="상단 메뉴"
      onMouseLeave={handleNavMouseLeave}
    >
      <span
        className={clsx(styles.indicatorHover, hoverVisible && styles.indicatorHoverVisible)}
        style={{
          transform: `translateX(${hoverIndicator.left}px)`,
          width: hoverIndicator.width,
        }}
        aria-hidden
      />
      {TOP_MENUS.map((menu) => {
        const active = isTopNavActive(pathname, menu)
        return (
          <NavLink
            key={menu.label}
            ref={(node) => {
              if (node) itemRefs.current.set(menu.label, node)
              else itemRefs.current.delete(menu.label)
            }}
            to={menu.to}
            end={menu.end}
            className={clsx(styles.menuItem, active && styles.menuItemActive)}
            aria-current={active ? 'page' : undefined}
            onMouseEnter={() => handleItemMouseEnter(menu.label, menu.to)}
          >
            {menu.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
