import styles from './FeedLoadingSpinner.module.css'

interface FeedLoadingSpinnerProps {
  /** 스크린 리더용 */
  label?: string
}

export function FeedLoadingSpinner({ label = '불러오는 중' }: FeedLoadingSpinnerProps) {
  return (
    <div className={styles.wrap} role="status" aria-label={label}>
      <span className={styles.spinner} aria-hidden />
    </div>
  )
}
