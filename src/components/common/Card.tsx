import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Card.module.css'

type CardPadding = 'none' | 'md' | 'lg'

export interface CardProps {
  children: ReactNode
  padding?: CardPadding
  className?: string
}

const padClass: Record<CardPadding, string> = {
  none: styles.padNone,
  md: styles.padMd,
  lg: styles.padLg,
}

export function Card({ children, padding = 'md', className }: CardProps) {
  return (
    <div className={clsx(styles.card, padClass[padding], className)}>
      {children}
    </div>
  )
}
