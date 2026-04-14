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
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
