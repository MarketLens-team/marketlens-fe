import { createPortal } from 'react-dom'
import styles from './BrandSplashLoading.module.css'

interface BrandSplashLoadingProps {
  /** `fixed` — 뷰포트 전체(기본). `inline` — 부모 영역 기준. */
  layout?: 'fixed' | 'inline'
  label?: string
}

export function BrandSplashLoading({
  layout = 'fixed',
  label = 'MarketLens 로딩 중',
}: BrandSplashLoadingProps) {
  const content = (
    <div
      className={layout === 'fixed' ? styles.overlayFixed : styles.overlayInline}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden>
          M
        </span>
        <span className={styles.wordmark}>MarketLens</span>
      </div>
    </div>
  )

  if (layout === 'fixed' && typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }

  return content
}
