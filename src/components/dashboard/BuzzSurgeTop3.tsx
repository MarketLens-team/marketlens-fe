import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { BuzzSurgeItem } from '../../data/types/dashboard'
import styles from './BuzzSurgeTop3.module.css'

interface BuzzSurgeTop3Props {
  items: BuzzSurgeItem[]
  className?: string
}

export function BuzzSurgeTop3({ items, className }: BuzzSurgeTop3Props) {
  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader
        title="언급량 급증 TOP 3"
        subtitle="전일 대비 뉴스 언급 급등"
        variant="embedded"
        showChevron
      />
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.rank} className={styles.item}>
            <span className={styles.rank}>{item.rank}</span>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.surge}>+{item.surgePercent}%</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
