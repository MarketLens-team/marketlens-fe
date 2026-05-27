import clsx from 'clsx'
import type { MyPageTab } from './profileTabs'
import { MY_PAGE_TABS } from './profileTabs'
import styles from './ProfileSideNav.module.css'

function AccountIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6 19.5c.665-2.866 3.134-5 6-5s5.335 2.134 6 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5l2.18 4.42 4.88.71-3.53 3.44.83 4.86L12 14.77l-4.36 2.16.83-4.86-3.53-3.44 4.88-.71L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 5h12a1 1 0 0 1 1 1v13l-3-2H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const TAB_ICONS: Record<MyPageTab, () => JSX.Element> = {
  watchlist: StarIcon,
  news: BookmarkIcon,
  account: AccountIcon,
}

interface ProfileSideNavProps {
  active: MyPageTab
  onChange: (tab: MyPageTab) => void
}

export function ProfileSideNav({ active, onChange }: ProfileSideNavProps) {
  return (
    <nav className={styles.nav} aria-label="마이페이지 메뉴">
      <ul className={styles.list}>
        {MY_PAGE_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id]
          const isActive = active === tab.id
          return (
            <li key={tab.id}>
              <button
                type="button"
                className={clsx(styles.item, isActive && styles.itemActive)}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onChange(tab.id)}
              >
                <Icon />
                <span className={styles.label}>{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

