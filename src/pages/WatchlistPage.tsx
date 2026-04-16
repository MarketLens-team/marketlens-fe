import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import { useWatchlistStore } from '../store/watchlistStore'
import styles from './WatchlistPage.module.css'

export default function WatchlistPage() {
  const items = useWatchlistStore((s) => s.items)
  const remove = useWatchlistStore((s) => s.remove)
  const navigate = useNavigate()

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader title="관심 목록" description="상단 검색/관심목록 메뉴에서 추가한 종목을 관리합니다." />
        {items.length === 0 ? <div className={styles.empty}>관심 목록이 비어 있습니다.</div> : null}
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.code} className={styles.item}>
              <div className={styles.meta}>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.code}>{item.code}</p>
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
    </Layout>
  )
}
