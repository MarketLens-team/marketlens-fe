import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './DevSidebarCompactPage.module.css'

const groupedMenus = [
  { title: 'MAIN', items: ['Overview', 'Dashboard'] },
  { title: 'ANALYSIS', items: ['Stock', 'People', 'Buzz'] },
  { title: 'ADMIN', items: ['Admin', 'Stocks', 'Crawling'] },
] as const

export default function DevSidebarCompactPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <main className={styles.page}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <button className={styles.collapseButton} type="button" onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? '>>' : '<<'} {!collapsed ? 'Collapse' : ''}
        </button>

        <div className={styles.groupList}>
          {groupedMenus.map((group) => (
            <section className={styles.group} key={group.title}>
              {!collapsed ? <p className={styles.groupTitle}>{group.title}</p> : null}
              {group.items.map((item, idx) => (
                <button type="button" className={`${styles.item} ${idx === 0 ? styles.active : ''}`} key={item}>
                  <span className={styles.icon}>{item.slice(0, 1)}</span>
                  {!collapsed ? <span>{item}</span> : null}
                </button>
              ))}
            </section>
          ))}
        </div>

        {!collapsed ? (
          <div className={styles.links}>
            <Link to="/dev/sidebar-minimal">Minimal 이동</Link>
            <Link to="/dev/sidebar-glass">Glass 이동</Link>
          </div>
        ) : null}
      </aside>

      <section className={styles.preview}>
        <h1>Grouped + Collapsible Sidebar</h1>
        <p>좌측 버튼으로 펼침/접힘을 전환해 아이콘 전용 모드를 테스트할 수 있습니다.</p>
      </section>
    </main>
  )
}
