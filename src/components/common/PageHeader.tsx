import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  align?: 'start' | 'center'
}

export function PageHeader({ title, description, actions, align = 'start' }: PageHeaderProps) {
  return (
    <header className={clsx(styles.wrap, align === 'center' && styles.wrapCenter)}>
      <div className={styles.top}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.desc}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  )
}
