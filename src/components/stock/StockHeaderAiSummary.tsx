import clsx from 'clsx'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { splitIntoSentences } from '../../lib/splitIntoSentences'
import { AiSummaryText } from '../common/AiSummaryText'
import { PillButton } from '../ui/PillButton'
import styles from './StockHeaderAiSummary.module.css'

export interface StockHeaderAiSummaryProps {
  summary: string | null | undefined
}

export function StockHeaderAiSummary({ summary }: StockHeaderAiSummaryProps) {
  const hasSummary = splitIntoSentences(summary).length > 0
  const textRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const measureOverflow = useCallback(() => {
    const el = textRef.current
    if (!el || expanded || !hasSummary) return
    setHasOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [expanded, hasSummary])

  useLayoutEffect(() => {
    if (!hasSummary) return
    measureOverflow()
    const el = textRef.current
    if (!el) return
    const observer = new ResizeObserver(() => measureOverflow())
    observer.observe(el)
    return () => observer.disconnect()
  }, [summary, measureOverflow, hasSummary])

  const showToggle = hasSummary && (hasOverflow || expanded)

  return (
    <div className={styles.root}>
      <p className={styles.label}>오늘 핫 이슈</p>
      {hasSummary ? (
        <>
          <p ref={textRef} className={clsx(styles.text, !expanded && styles.textClamped)}>
            <AiSummaryText text={summary} />
          </p>
          {showToggle ? (
            <PillButton
              variant="ghost"
              className={styles.toggle}
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? '접기' : '더보기'}
            </PillButton>
          ) : null}
        </>
      ) : (
        <p className={styles.empty}>오늘 핫 이슈가 없습니다</p>
      )}
    </div>
  )
}
