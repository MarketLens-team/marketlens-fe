import clsx from 'clsx'
import { useId, type ReactNode } from 'react'
import styles from './HelpTooltip.module.css'

export interface HelpTooltipProps {
  label: string
  children: ReactNode
  className?: string
  /** 기본보다 큰 트리거·팝오버 (대시보드 KOSPI 등) */
  size?: 'sm' | 'md'
}

export function HelpTooltip({ label, children, className, size = 'sm' }: HelpTooltipProps) {
  const tooltipId = useId()

  return (
    <span className={clsx(styles.wrap, size === 'md' && styles.sizeMd, className)}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-describedby={tooltipId}
      >
        <span className={styles.icon} aria-hidden>
          i
        </span>
      </button>
      <div id={tooltipId} role="tooltip" className={styles.popover}>
        {children}
      </div>
    </span>
  )
}
