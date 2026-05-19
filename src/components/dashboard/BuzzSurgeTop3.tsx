import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { BuzzSurgeItem } from '../../data/types/dashboard'
import shared from './dashboardShared.module.css'
import styles from './BuzzSurgeTop3.module.css'

interface BuzzSurgeTop3Props {
  items: BuzzSurgeItem[]
}

export function BuzzSurgeTop3({ items }: BuzzSurgeTop3Props) {
  return (
    <Card padding="lg" className={styles.card}>
      <CardSectionHeader
        title="언급량 급증 TOP 3"
        subtitle="전일 대비 뉴스 언급 급등"
        className={shared.sectionHeadCenter}
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
