import { Link, NavLink } from 'react-router-dom'
import styles from './DevSidebarMinimalPage.module.css'

const groups = [
  {
    title: 'CORE',
    items: [
      { label: 'Overview', to: '#' },
      { label: 'Dashboard', to: '#' },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'Stock Search', to: '#' },
      { label: 'People Tracker', to: '#' },
      { label: 'Buzz Alert', to: '#' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [{ label: 'Admin', to: '#' }],
  },
] as const

export default function DevSidebarMinimalPage() {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <header className={styles.brand}>
          <p className={styles.brandTitle}>MARKETLENS</p>
          <p className={styles.brandSub}>Sentiment Engine</p>
        </header>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <section key={group.title} className={styles.group}>
              <p className={styles.groupLabel}>{group.title}</p>
              {group.items.map((item, index) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.item} ${index === 0 || isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.dot} />
                  {item.label}
                </NavLink>
              ))}
            </section>
          ))}
        </nav>

        <footer className={styles.footer}>
          <Link className={styles.link} to="/dev/sidebar-glass">
            Glass 버전 보기
          </Link>
          <Link className={styles.link} to="/dev/sidebar-compact">
            Compact 버전 보기
          </Link>
        </footer>
      </aside>

      <section className={styles.preview}>
        <h1>Minimal Clean + Accent</h1>
        <p>얇은 액센트 바, 단순한 그룹 구분, 낮은 시각 노이즈를 목표로 한 스타일입니다.</p>
      </section>
    </main>
  )
}
