import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { ButtonSpinner } from './ButtonSpinner'
import styles from './ActionButton.module.css'

export type ActionButtonVariant = 'confirm' | 'danger'

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: ActionButtonVariant
  children: ReactNode
}

export function ActionButton({
  loading = false,
  disabled = false,
  variant = 'confirm',
  className,
  onClick,
  children,
  ...rest
}: ActionButtonProps) {
  const isDisabled = disabled || loading
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading}
      data-loading={loading ? 'true' : 'false'}
      onClick={handleClick}
    >
      <span className={styles.label}>{children}</span>
      {loading ? <ButtonSpinner /> : null}
    </button>
  )
}
