import clsx from 'clsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './UnderlineTabNav.module.css'

interface IndicatorPos {
  left: number
  width: number
}

const HIDDEN_POS: IndicatorPos = { left: 0, width: 0 }

export interface UnderlineTabOption<T extends string> {
  key: T
  label: string
}

interface UnderlineTabNavProps<T extends string> {
  options: UnderlineTabOption<T>[]
  value: T
  onChange: (key: T) => void
  ariaLabel?: string
  /** `underline`(기본) — 활성·호버 언더라인 / `text` — 활성 탭 파란색·볼드·언더라인, 호버 인디케이터 없음 */
  variant?: 'underline' | 'text'
  className?: string
}

export function UnderlineTabNav<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = 'underline',
  className,
}: UnderlineTabNavProps<T>) {
  const showHoverIndicator = variant === 'underline'
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef(new Map<T, HTMLButtonElement>())
  const [hoverKey, setHoverKey] = useState<T | null>(null)
  const [hoverIndicator, setHoverIndicator] = useState<IndicatorPos>(HIDDEN_POS)
  const [hoverVisible, setHoverVisible] = useState(false)

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
    if (!showHoverIndicator || !hoverKey || hoverKey === value) {
      setHoverVisible(false)
      return
    }
    const pos = measureItem(itemRefs.current.get(hoverKey) ?? null)
    if (!pos) {
      setHoverVisible(false)
      return
    }
    setHoverIndicator(pos)
    setHoverVisible(true)
  }, [hoverKey, value, measureItem, showHoverIndicator])

  useLayoutEffect(() => {
    syncHoverIndicator()
  }, [syncHoverIndicator, value, options])

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
    setHoverKey(null)
    setHoverVisible(false)
  }

  const handleItemMouseEnter = (key: T) => {
    if (!showHoverIndicator) return
    setHoverKey(key)
    if (key === value) {
      setHoverVisible(false)
      return
    }
    const pos = measureItem(itemRefs.current.get(key) ?? null)
    if (pos) {
      setHoverIndicator(pos)
      setHoverVisible(true)
    }
  }

  return (
    <nav
      ref={navRef}
      className={clsx(
        styles.nav,
        variant === 'text' ? styles.navText : styles.navUnderline,
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
      onMouseLeave={showHoverIndicator ? handleNavMouseLeave : undefined}
    >
      {showHoverIndicator ? (
        <span
          className={clsx(styles.indicatorHover, hoverVisible && styles.indicatorHoverVisible)}
          style={{
            transform: `translateX(${hoverIndicator.left}px)`,
            width: hoverIndicator.width,
          }}
          aria-hidden
        />
      ) : null}
      {options.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            ref={(node) => {
              if (node) itemRefs.current.set(opt.key, node)
              else itemRefs.current.delete(opt.key)
            }}
            type="button"
            role="tab"
            aria-selected={active}
            className={clsx(styles.tab, active && styles.tabActive)}
            onClick={() => onChange(opt.key)}
            onMouseEnter={() => handleItemMouseEnter(opt.key)}
          >
            {opt.label}
          </button>
        )
      })}
    </nav>
  )
}
