import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { EntityAvatar } from '../ui/EntityAvatar'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { PersonMentionsRange, PersonTopItem } from '../../data/types/person'
import { PersonPanelRangeToggle } from './PersonPanelRangeToggle'
import { formatPersonRole } from './personDisplay'
import styles from './PersonTop5Panel.module.css'

interface PersonTop5PanelProps {
  items: PersonTopItem[]
  range: PersonMentionsRange
  onRangeChange: (range: PersonMentionsRange) => void
  loading?: boolean
}

export function PersonTop5Panel({ items, range, onRangeChange, loading }: PersonTop5PanelProps) {
  const rankedItems = items.filter((person) => person.mentionCount > 0)

  return (
    <Card padding="md" className={styles.card} aria-busy={loading || undefined}>
      <div className={styles.cardHead}>
        <CardSectionHeader title="언급량 TOP 5 인물" variant="embedded" className={styles.cardTitle} />
        <PersonPanelRangeToggle range={range} onChange={onRangeChange} aria-label="TOP 5 기간" />
      </div>
      {rankedItems.length === 0 ? (
        <p className={clsx(styles.empty, loading && styles.contentDimmed)}>언급 인물 데이터가 없습니다</p>
      ) : (
        <ol className={clsx(styles.list, loading && styles.contentDimmed)}>
          {rankedItems.map((person, index) => (
            <li key={person.personId}>
              <Link to={`/person/${person.personId}`} className={styles.item}>
                <span className={styles.rank}>{index + 1}</span>
                <EntityAvatar
                  variant="person"
                  size="md"
                  name={person.personName}
                  imageUrl={person.imageUrl}
                />
                <div className={styles.body}>
                  <p className={styles.name}>{person.personName}</p>
                  <p className={styles.role}>
                    {formatPersonRole(person.organizationName, person.role)}
                  </p>
                </div>
                <span className={styles.count}>{person.mentionCount}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
