import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { PersonFrequentStock, PersonMentionsRange } from '../../data/types/person'
import { PersonPanelRangeToggle } from './PersonPanelRangeToggle'
import styles from './PersonFrequentStocksPanel.module.css'

interface PersonFrequentStocksPanelProps {
  items: PersonFrequentStock[]
  title?: string
  range: PersonMentionsRange
  onRangeChange: (range: PersonMentionsRange) => void
  loading?: boolean
}

export function PersonFrequentStocksPanel({
  items,
  title = '자주 언급된 종목',
  range,
  onRangeChange,
  loading,
}: PersonFrequentStocksPanelProps) {
  return (
    <Card padding="md" className={styles.card} aria-busy={loading || undefined}>
      <div className={styles.cardHead}>
        <CardSectionHeader title={title} variant="embedded" className={styles.cardTitle} />
        <PersonPanelRangeToggle range={range} onChange={onRangeChange} aria-label="연관 종목 기간" />
      </div>
      {items.length === 0 ? (
        <p className={clsx(styles.empty, loading && styles.contentDimmed)}>연관 종목 데이터가 없습니다</p>
      ) : (
        <div className={clsx(styles.tags, loading && styles.contentDimmed)}>
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
