import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './PillButton.module.css'

export type PillButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillButtonVariant
  fullWidth?: boolean
  compact?: boolean
  /** secondary 필터·탭 등 선택 상태 */
  active?: boolean
  children: ReactNode
}

export function PillButton({
  variant = 'primary',
  fullWidth = false,
  compact = false,
  active = false,
  className,
  type = 'button',
  children,
  ...rest
}: PillButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        compact && styles.compact,
        variant === 'secondary' && active && styles.secondaryActive,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
