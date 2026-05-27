import clsx from 'clsx'
import styles from './NewsBookmarkButton.module.css'

export interface NewsBookmarkButtonProps {
  bookmarked: boolean
  pending?: boolean
  onToggle: () => void
  className?: string
}

export function NewsBookmarkButton({
  bookmarked,
  pending = false,
  onToggle,
  className,
}: NewsBookmarkButtonProps) {
  const label = bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'

  return (
    <button
      type="button"
      className={clsx(styles.btn, bookmarked && styles.btnActive, className)}
      aria-pressed={bookmarked}
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
        {bookmarked ? '★' : '☆'}
      </span>
    </button>
  )
}
