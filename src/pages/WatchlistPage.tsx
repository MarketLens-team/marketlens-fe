import { useNavigate } from 'react-router-dom'
import {
  DetailMainGroup,
  DetailMainGroupPlaceholder,
  DetailSplitShell,
  type DetailAccordionSidebarGroup,
} from '../components/common/DetailSplitShell'
import { EntityAvatar } from '../components/ui/EntityAvatar'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import { useWatchlistStore } from '../store/watchlistStore'
import styles from './WatchlistPage.module.css'

type WatchlistSidebarKey = 'overview' | 'lists' | 'news'

const watchlistSidebarGroups: DetailAccordionSidebarGroup<WatchlistSidebarKey>[] = [
  {
    key: 'overview',
    section: '개요',
    icon: '⭐',
    items: [
      { id: 'watchlist-summary', label: '관심목록 요약' },
      { id: 'watchlist-alert', label: '알림 현황' },
    ],
  },
  {
    key: 'lists',
    section: '목록',
    icon: '📌',
    items: [
      { id: 'watchlist-stock', label: '종목 목록' },
      { id: 'watchlist-people', label: '인물 목록' },
    ],
  },
  {
    key: 'news',
    section: '뉴스',
    icon: '📰',
    items: [{ id: 'watchlist-news', label: '연관 뉴스' }],
  },
]

export default function WatchlistPage() {
  const items = useWatchlistStore((s) => s.items)
  const remove = useWatchlistStore((s) => s.remove)
  const navigate = useNavigate()

  return (
    <Layout>
      <DetailSplitShell groups={watchlistSidebarGroups}>
        <DetailMainGroup>
          <PageHeader title="관심 목록" description="상단 검색/관심목록 메뉴에서 추가한 종목을 관리합니다." />
        </DetailMainGroup>
        <DetailMainGroup>
          <div className={styles.stack}>
            {items.length === 0 ? <div className={styles.empty}>관심 목록이 비어 있습니다.</div> : null}
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.code} className={styles.item}>
                  <div className={styles.itemLead}>
                    <EntityAvatar variant="stock" size="sm" name={item.name} imageUrl={item.imageUrl} />
                    <div className={styles.meta}>
                      <p className={styles.name}>{item.name}</p>
                      <p className={styles.code}>{item.code}</p>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btn} onClick={() => navigate(`/stock/${item.code}`)}>
                      상세 보기
                    </button>
                    <button type="button" className={styles.btn} onClick={() => remove(item.code)}>
                      제거
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DetailMainGroup>
        <DetailMainGroup>
          <DetailMainGroupPlaceholder>연관 뉴스는 다음 단계에서 연결 예정입니다.</DetailMainGroupPlaceholder>
        </DetailMainGroup>
      </DetailSplitShell>
    </Layout>
  )
}
