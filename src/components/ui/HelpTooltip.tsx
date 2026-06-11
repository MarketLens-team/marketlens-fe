import clsx from 'clsx'
import { useId, type ReactNode } from 'react'
import styles from './HelpTooltip.module.css'

export interface HelpTooltipProps {
  label: string
  children: ReactNode
  className?: string
}

export function HelpTooltip({ label, children, className }: HelpTooltipProps) {
  const tooltipId = useId()

  return (
    <span className={clsx(styles.wrap, className)}>
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
