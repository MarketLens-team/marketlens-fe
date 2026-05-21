import clsx from 'clsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TOP_MENUS, isTopNavActive } from './topNavMenus'
import styles from './TopNavMenu.module.css'

interface IndicatorState {
  left: number
  width: number
  visible: boolean
}

const HIDDEN_INDICATOR: IndicatorState = { left: 0, width: 0, visible: false }

export function TopNavMenu() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [indicator, setIndicator] = useState<IndicatorState>(HIDDEN_INDICATOR)
  const [hoverLabel, setHoverLabel] = useState<string | null>(null)

  const activeLabel = TOP_MENUS.find((item) => isTopNavActive(pathname, item))?.label ?? null

  const measureItem = useCallback((el: HTMLElement | null): Pick<IndicatorState, 'left' | 'width'> | null => {
    const nav = navRef.current
    if (!el || !nav) return null
    const navRect = nav.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    return {
      left: rect.left - navRect.left,
      width: rect.width,
    }
  }, [])

  const moveIndicatorTo = useCallback(
    (label: string | null) => {
      if (!label) {
        setIndicator(HIDDEN_INDICATOR)
        return
      }
      const el = itemRefs.current.get(label)
      const pos = measureItem(el ?? null)
      if (!pos) return
      setIndicator({ ...pos, visible: true })
    },
    [measureItem],
  )

  const syncIndicator = useCallback(() => {
    moveIndicatorTo(hoverLabel ?? activeLabel)
  }, [hoverLabel, activeLabel, moveIndicatorTo])

  useLayoutEffect(() => {
    syncIndicator()
  }, [pathname, syncIndicator])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const ro = new ResizeObserver(() => syncIndicator())
    ro.observe(nav)

    const onResize = () => syncIndicator()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [syncIndicator])

  const handleNavMouseLeave = () => {
    setHoverLabel(null)
    moveIndicatorTo(activeLabel)
  }

  const handleItemMouseEnter = (label: string) => {
    setHoverLabel(label)
    moveIndicatorTo(label)
  }

  return (
    <nav
      ref={navRef}
      className={styles.menu}
      aria-label="상단 메뉴"
      onMouseLeave={handleNavMouseLeave}
    >
      <span
        className={clsx(styles.indicator, indicator.visible && styles.indicatorVisible)}
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: indicator.width,
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
            onMouseEnter={() => handleItemMouseEnter(menu.label)}
          >
            {menu.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
