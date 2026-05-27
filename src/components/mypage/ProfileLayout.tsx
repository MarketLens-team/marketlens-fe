import type { ReactNode } from 'react'
import styles from './ProfileLayout.module.css'

export function ProfileLayout({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.pageLayout}>
      <div className={styles.nav}>{nav}</div>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
