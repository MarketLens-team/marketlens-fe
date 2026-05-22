import clsx from 'clsx'
import type { PersonMentionsRange } from '../../data/types/person'
import styles from './PersonPanelRangeToggle.module.css'

interface PersonPanelRangeToggleProps {
  range: PersonMentionsRange
  onChange: (range: PersonMentionsRange) => void
  className?: string
  /** 카드 헤더용 짧은 라벨 */
  'aria-label'?: string
}

export function PersonPanelRangeToggle({
  range,
  onChange,
  className,
  'aria-label': ariaLabel = '기간',
}: PersonPanelRangeToggleProps) {
  return (
    <div className={clsx(styles.root, className)} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={clsx(styles.btn, range === 'today' && styles.btnActive)}
        aria-pressed={range === 'today'}
        onClick={() => onChange('today')}
      >
        오늘
      </button>
      <button
        type="button"
        className={clsx(styles.btn, range === '7d' && styles.btnActive)}
        aria-pressed={range === '7d'}
        onClick={() => onChange('7d')}
      >
        7일
      </button>
    </div>
  )
}
