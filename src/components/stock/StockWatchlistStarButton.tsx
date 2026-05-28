import clsx from 'clsx'
import styles from './StockWatchlistStarButton.module.css'

export interface StockWatchlistStarButtonProps {
  interested: boolean
  pending?: boolean
  onToggle: () => void
  size?: 'md' | 'lg'
  className?: string
}

export function StockWatchlistStarButton({
  interested,
  pending = false,
  onToggle,
  size = 'md',
  className,
}: StockWatchlistStarButtonProps) {
  const label = interested ? '관심종목 해제' : '관심종목 추가'

  return (
    <button
      type="button"
      className={clsx(
        styles.btn,
        size === 'lg' && styles.btnLg,
        interested && styles.btnActive,
        className,
      )}
      aria-pressed={interested}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle()
      }}
    >
      <span className={styles.icon} aria-hidden>
        {interested ? '★' : '☆'}
      </span>
    </button>
  )
}
