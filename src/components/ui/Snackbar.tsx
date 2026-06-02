import styles from './Snackbar.module.css'

interface SnackbarProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function Snackbar({ message, actionLabel, onAction }: SnackbarProps) {
  return (
    <div className={styles.snackbar} role="status" aria-live="polite">
      <span>{message}</span>
      {actionLabel && onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          <svg
            className={styles.actionIcon}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 4L3 7L6 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 7H9.25C11.3211 7 13 8.67893 13 10.75V11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
