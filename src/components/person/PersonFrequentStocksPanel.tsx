import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { PersonFrequentStock } from '../../data/types/person'
import styles from './PersonFrequentStocksPanel.module.css'

interface PersonFrequentStocksPanelProps {
  items: PersonFrequentStock[]
}

export function PersonFrequentStocksPanel({ items }: PersonFrequentStocksPanelProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="자주 언급된 종목" variant="embedded" />
      {items.length === 0 ? (
        <p className={styles.empty}>연관 종목 데이터가 없습니다</p>
      ) : (
        <div className={styles.tags}>
          {items.map((stock) => (
            <Link key={stock.code} className={styles.tag} to={`/stock/${stock.code}`}>
              #{stock.name}
              <span className={styles.count}>{stock.mentionCount}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
