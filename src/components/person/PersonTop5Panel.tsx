import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { PersonTopItem } from '../../data/types/person'
import { formatPersonRole } from './personDisplay'
import styles from './PersonTop5Panel.module.css'

interface PersonTop5PanelProps {
  items: PersonTopItem[]
}

export function PersonTop5Panel({ items }: PersonTop5PanelProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="언급량 TOP 5 인물" variant="embedded" />
      <ol className={styles.list}>
        {items.map((person, index) => (
          <li key={person.personId} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <div className={styles.body}>
              <p className={styles.name}>{person.personName}</p>
              <p className={styles.role}>
                {formatPersonRole(person.organizationName, person.role)}
              </p>
            </div>
            <span className={styles.count}>{person.mentionCount}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
