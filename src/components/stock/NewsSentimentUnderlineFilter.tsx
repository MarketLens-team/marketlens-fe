import clsx from 'clsx'
import styles from './NewsSentimentUnderlineFilter.module.css'

export type NewsSentimentFilterValue = 'all' | 'positive' | 'negative'

interface NewsSentimentUnderlineFilterProps {
  value: NewsSentimentFilterValue
  onChange: (value: NewsSentimentFilterValue) => void
  className?: string
  /** @default sm — 종목 상세 패널 */
  size?: 'sm' | 'md'
  /** 제목과 같은 행 — 바 하단 구분선 없음 */
  embedded?: boolean
}

const OPTIONS: ReadonlyArray<{
  value: NewsSentimentFilterValue
  label: string
  tone?: 'positive' | 'negative'
}> = [
  { value: 'all', label: '전체' },
  { value: 'positive', label: '긍정', tone: 'positive' },
  { value: 'negative', label: '부정', tone: 'negative' },
]

export function NewsSentimentUnderlineFilter({
  value,
  onChange,
  className,
  size = 'sm',
  embedded = false,
}: NewsSentimentUnderlineFilterProps) {
  return (
    <div
      className={clsx(
        styles.bar,
        size === 'md' && styles.barMd,
        embedded && styles.barEmbedded,
        className,
      )}
      role="tablist"
      aria-label="뉴스 감성 필터"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={clsx(
              styles.tab,
              size === 'md' && styles.tabMd,
              option.tone === 'positive' && styles.tabPositive,
              option.tone === 'negative' && styles.tabNegative,
              active && option.value === 'all' && styles.tabAllActive,
              active && option.tone === 'positive' && styles.tabPositiveActive,
              active && option.tone === 'negative' && styles.tabNegativeActive,
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
