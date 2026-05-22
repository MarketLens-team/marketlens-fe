import clsx from 'clsx'
import type { PersonMentionsRange } from '../../data/types/person'
import styles from './PersonPanelRangeToggle.module.css'

interface PersonPanelRangeToggleProps {
  range: PersonMentionsRange
  onChange: (range: PersonMentionsRange) => void
  className?: string
  'aria-label'?: string
}

const RANGE_LABEL: Record<PersonMentionsRange, string> = {
  today: '오늘',
  '7d': '7일',
}

function nextRange(current: PersonMentionsRange): PersonMentionsRange {
  return current === 'today' ? '7d' : 'today'
}

export function PersonPanelRangeToggle({
  range,
  onChange,
  className,
  'aria-label': ariaLabel = '기간',
}: PersonPanelRangeToggleProps) {
  const label = RANGE_LABEL[range]

  return (
    <button
      type="button"
      className={clsx(styles.btn, className)}
      aria-label={`${ariaLabel}: ${label}. 클릭하면 기간이 바뀝니다`}
      onClick={() => onChange(nextRange(range))}
    >
      {label}
    </button>
  )
}
