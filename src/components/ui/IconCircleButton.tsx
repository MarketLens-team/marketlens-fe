import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'
import styles from './IconCircleButton.module.css'

export type IconCircleButtonDirection = 'back' | 'up'
export type IconCircleButtonSurface = 'elevated' | 'modal'
export type IconCircleButtonSize = 'md' | 'lg'

const ICON_PATH: Record<IconCircleButtonDirection, string> = {
  back: 'M15 18l-6-6 6-6',
  up: 'M6 15l6-6 6 6',
}

export interface IconCircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: IconCircleButtonDirection
  surface?: IconCircleButtonSurface
  size?: IconCircleButtonSize
  'aria-label': string
}

export function IconCircleButton({
  direction,
  surface = 'elevated',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconCircleButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        size === 'lg' ? styles.sizeLg : styles.sizeMd,
        surface === 'modal' && styles.surfaceModal,
        className,
      )}
      {...rest}
    >
      <svg
        className={clsx(styles.icon, size === 'lg' ? styles.iconLg : styles.iconMd)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d={ICON_PATH[direction]}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
