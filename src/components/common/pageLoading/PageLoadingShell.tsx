import type { ReactNode } from 'react'
import styles from './PageLoadingShell.module.css'

interface PageLoadingShellProps {
  children: ReactNode
  label: string
  className?: string
}

export function PageLoadingShell({ children, label, className }: PageLoadingShellProps) {
  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(' ')}
      aria-busy="true"
      aria-label={label}
    >
      {children}
    </div>
  )
}
