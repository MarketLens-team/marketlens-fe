import { Link, NavLink } from 'react-router-dom'
import styles from './DevSidebarGlassPage.module.css'

const menus = ['Overview', 'Dashboard', 'Stock Search', 'People Tracker', 'Buzz Alert', 'Admin'] as const

export default function DevSidebarGlassPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noise} />
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <p className={styles.title}>ML / AI Console</p>
          <p className={styles.sub}>Glassmorphism Preview</p>
        </div>

        <nav className={styles.nav}>
          {menus.map((label, idx) => (
            <NavLink
              key={label}
              to="#"
              className={({ isActive }) => `${styles.item} ${idx === 1 || isActive ? styles.active : ''}`}
            >
              <span className={styles.pill} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link to="/dev/sidebar-minimal" className={styles.link}>
            Minimal 이동
          </Link>
          <Link to="/dev/sidebar-compact" className={styles.link}>
            Compact 이동
          </Link>
        </div>
      </aside>

      <section className={styles.preview}>
        <h1>Glassmorphism Sidebar</h1>
        <p>
          반투명 레이어와 블러, 약한 보더 글로우를 조합한 스타일입니다. AI/테크 무드를 강조하되
          텍스트 가독성은 유지하도록 대비를 강하게 두었습니다.
        </p>
      </section>
    </main>
  )
}
