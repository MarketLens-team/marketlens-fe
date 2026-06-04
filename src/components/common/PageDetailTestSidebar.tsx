import styles from './PageDetailTestSidebar.module.css'

type TestTabId =
  | 'sector'
  | 'watchlist'
  | 'stock'
  | 'person'
  | 'buzz'
  | 'sentiment'
  | 'sectorNews'
  | 'stockNews'
  | 'personNews'

const tabGroups = [
  {
    title: 'INDICATORS',
    items: [
      { id: 'sentiment', label: '감성 지수' },
      { id: 'sector', label: '섹터' },
      { id: 'stock', label: '종목' },
      { id: 'person', label: '인물' },
      { id: 'buzz', label: '버즈 알림' },
    ],
  },
  {
    title: 'NEWS',
    items: [
      { id: 'sectorNews', label: '섹터 뉴스' },
      { id: 'stockNews', label: '종목 뉴스' },
      { id: 'personNews', label: '인물 뉴스' },
      { id: 'watchlist', label: '관심 목록' },
    ],
  },
] as const satisfies ReadonlyArray<{
  title: string
  items: ReadonlyArray<{ id: TestTabId; label: string }>
}>

interface PageDetailTestSidebarProps {
  activeTab: TestTabId
}

export function PageDetailTestSidebar({ activeTab }: PageDetailTestSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="페이지 테스트 사이드바">
      <p className={styles.title}>상세 테스트 모듈</p>
      {tabGroups.map((group) => (
        <section key={group.title} className={styles.group}>
          <p className={styles.groupTitle}>{group.title}</p>
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${activeTab === item.id ? styles.active : ''}`}
            >
              {item.label}
            </button>
          ))}
        </section>
      ))}
    </aside>
  )
}
