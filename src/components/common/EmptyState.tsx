import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  title: string
  message?: string
  hint?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function EmptyState({ title, message, hint, icon, actions, className }: EmptyStateProps) {
  return (
    <div className={clsx(styles.root, className)}>
      {icon ? <div className={styles.icon}>{icon}</div> : null}
      <h3 className={styles.title}>{title}</h3>
      {message ? <p className={styles.message}>{message}</p> : null}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}
