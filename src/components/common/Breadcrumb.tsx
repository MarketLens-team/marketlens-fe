import clsx from 'clsx'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export type BreadcrumbLinkItem = {
  label: string
  to: string
}

export type BreadcrumbCurrentItem = {
  label: string
  current: true
}

export type BreadcrumbItem = BreadcrumbLinkItem | BreadcrumbCurrentItem

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav className={clsx(styles.nav, className)} aria-label="경로">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <li className={styles.sepItem} aria-hidden>
                  <span className={styles.sep}>/</span>
                </li>
              ) : null}
              <li className={styles.item}>
                {'current' in item ? (
                  <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <Link className={styles.link} to={item.to}>
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
