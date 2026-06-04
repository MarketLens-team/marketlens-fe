import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import { AiSummaryText } from '../common/AiSummaryText'
import { Modal } from '../ui/Modal'
import { EntityAvatar } from '../ui/EntityAvatar'
import { PillButton } from '../ui/PillButton'
import type { AnomalySummaryStatus, OpenAnomalySummary } from './useDashboardAnomalySummary'
import styles from './DashboardAnomalySummaryModal.module.css'

interface DashboardAnomalySummaryModalProps {
  target: OpenAnomalySummary | null
  status: AnomalySummaryStatus
  summaryText: string | null
  isOpen: boolean
  onClose: () => void
  onHoverPaneEnter?: () => void
  onHoverPaneLeave?: () => void
}

export function DashboardAnomalySummaryModal({
  target,
  status,
  summaryText,
  isOpen,
  onClose,
  onHoverPaneEnter,
  onHoverPaneLeave,
}: DashboardAnomalySummaryModalProps) {
  const navigate = useNavigate()
  if (!target) return null

  const goToStock = () => {
    onClose()
    navigate(`/stock/${target.code}`)
  }

  const hoverZoneHandlers = {
    onMouseEnter: onHoverPaneEnter,
    onMouseLeave: onHoverPaneLeave,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      lockBackgroundScroll
      closeOnOverlay
      closeOnEsc
      overlayClassName={styles.hoverOverlay}
      contentClassOnly
      contentClassName={styles.shell}
      bodyClassName={styles.modalBody}
    >
      <div className={styles.hoverZone} {...hoverZoneHandlers}>
        <div className={styles.pane}>
          <header className={styles.header}>
          <EntityAvatar
            key={target.code}
            variant="stock"
            size="lg"
            name={target.name}
            imageUrl={resolveStockImageUrl(target.code, target.imageUrl)}
            className={styles.avatar}
          />
          <div className={styles.heading}>
            <h2 className={styles.title}>{target.name}</h2>
            <p className={styles.meta}>
              <span className={styles.signalLabel}>{target.signalLabel}</span>
              <span
                className={clsx(
                  styles.metric,
                  target.headlineTone === 'up' && styles.metricUp,
                  target.headlineTone === 'down' && styles.metricDown,
                  target.headlineTone === 'neu' && styles.metricNeu,
                )}
              >
                {target.headline}
              </span>
            </p>
          </div>
          <button type="button" className={styles.closeBtn} aria-label="닫기" onClick={onClose}>
            ×
          </button>
          </header>

          <div className={styles.body}>
          {status === 'loading' ? (
            <p className={styles.status} aria-busy="true">
              AI 요약을 불러오는 중…
            </p>
          ) : null}
          {status === 'error' ? (
            <p className={styles.status}>요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          ) : null}
          {status === 'empty' ? (
            <p className={styles.status}>표시할 AI 요약이 없습니다.</p>
          ) : null}
          {status === 'ready' && summaryText ? (
            <p className={styles.summary}>
              <AiSummaryText text={summaryText} sentenceClassName={styles.summarySentence} />
            </p>
          ) : null}
          </div>

          <div className={styles.actions}>
            <PillButton variant="primary" compact type="button" onClick={goToStock}>
              종목 상세
            </PillButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}
