import clsx from 'clsx'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AiSummaryText } from '../common/AiSummaryText'
import styles from './StockHeaderAiSummary.module.css'

export interface StockHeaderAiSummaryProps {
  summary: string | null | undefined
}

export function StockHeaderAiSummary({ summary }: StockHeaderAiSummaryProps) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const measureOverflow = useCallback(() => {
    const el = textRef.current
    if (!el || expanded) return
    setHasOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [expanded])

  useLayoutEffect(() => {
    measureOverflow()
    const el = textRef.current
    if (!el) return
    const observer = new ResizeObserver(() => measureOverflow())
    observer.observe(el)
    return () => observer.disconnect()
  }, [summary, measureOverflow])

  const showToggle = hasOverflow || expanded

  return (
    <div className={styles.root}>
      <p className={styles.label}>오늘 핫 이슈</p>
      <p ref={textRef} className={clsx(styles.text, !expanded && styles.textClamped)}>
        <AiSummaryText text={summary} />
      </p>
      {showToggle ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      ) : null}
    </div>
  )
}
