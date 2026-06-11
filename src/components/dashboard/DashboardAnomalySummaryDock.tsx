import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import { AiSummaryText } from '../common/AiSummaryText'
import { EntityAvatar } from '../ui/EntityAvatar'
import { PillButton } from '../ui/PillButton'
import type { AnomalySummaryStatus, OpenAnomalySummary } from './useDashboardAnomalySummary'
import styles from './DashboardAnomalySummaryDock.module.css'

interface DashboardAnomalySummaryDockProps {
  lastTarget: OpenAnomalySummary | null
  target: OpenAnomalySummary | null
  status: AnomalySummaryStatus
  summaryText: string | null
  isPanelOpen: boolean
  isVisible: boolean
  onDismiss: () => void
  onHoverPaneEnter?: () => void
  onHoverPaneLeave?: () => void
}

function ChatIcon() {
  return (
    <svg className={styles.fabIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 9.5h10M7 13h6M6 18.5 4 20V6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4a2.8 2.8 0 0 1-2.8 2.8H9l-3 2.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DashboardAnomalySummaryDock({
  lastTarget,
  target,
  status,
  summaryText,
  isPanelOpen,
  isVisible,
  onDismiss,
  onHoverPaneEnter,
  onHoverPaneLeave,
}: DashboardAnomalySummaryDockProps) {
  const navigate = useNavigate()
  const dockRef = useRef<HTMLDivElement>(null)
  const panelTarget = isPanelOpen ? target : null
  const fabName = lastTarget?.name ?? ''

  useEffect(() => {
    if (!isPanelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPanelOpen, onDismiss])

  useEffect(() => {
    if (!isVisible) return
    const onPointerDown = (event: PointerEvent) => {
      if (dockRef.current?.contains(event.target as Node)) return
      onDismiss()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isVisible, onDismiss])

  if (!isVisible || !lastTarget) return null

  const goToStock = () => {
    if (!panelTarget) return
    onDismiss()
    navigate(`/stock/${panelTarget.code}`)
  }

  const fabLabel = `${fabName} AI 요약 닫기`

  return createPortal(
    <div ref={dockRef} className={styles.dockFixed} aria-live="polite">
      <div
        className={clsx(styles.stack, styles.stackInteractive)}
        onMouseEnter={onHoverPaneEnter}
        onMouseLeave={onHoverPaneLeave}
      >
        {isPanelOpen && panelTarget ? (
          <div className={styles.panel} role="region" aria-label={`${panelTarget.name} AI 이슈 요약`}>
            <header className={styles.header}>
              <EntityAvatar
                key={panelTarget.code}
                variant="stock"
                size="md"
                name={panelTarget.name}
                imageUrl={resolveStockImageUrl(panelTarget.code, panelTarget.imageUrl)}
                className={styles.avatar}
              />
              <div className={styles.heading}>
                <h2 className={styles.title}>{panelTarget.name}</h2>
                <p className={styles.meta}>
                  <span className={styles.signalLabel}>{panelTarget.signalLabel}</span>
                  <span
                    className={clsx(
                      styles.metric,
                      panelTarget.headlineTone === 'up' && styles.metricUp,
                      panelTarget.headlineTone === 'down' && styles.metricDown,
                      panelTarget.headlineTone === 'neu' && styles.metricNeu,
                    )}
                  >
                    {panelTarget.headline}
                  </span>
                </p>
              </div>
              <button type="button" className={styles.closeBtn} aria-label="닫기" onClick={onDismiss}>
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
                <p className={styles.status}>표시할 AI 요약이 없습니다. 종목 상세에서 확인해 보세요.</p>
              ) : null}
              {status === 'ready' && summaryText ? (
                <p className={styles.summary}>
                  <AiSummaryText text={summaryText} sentenceClassName={styles.summarySentence} />
                </p>
              ) : null}
            </div>

            <div className={styles.actions}>
              <PillButton variant="secondary" compact disableHover type="button" onClick={onDismiss}>
                확인
              </PillButton>
              <PillButton variant="primary" compact disableHover type="button" onClick={goToStock}>
                종목 상세
              </PillButton>
            </div>
          </div>
        ) : null}

        <div className={styles.fabWrap}>
          <button
            type="button"
            className={clsx(styles.fab, isPanelOpen && styles.fabActive)}
            aria-label={fabLabel}
            aria-expanded={isPanelOpen}
            onClick={onDismiss}
          >
            <ChatIcon />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
