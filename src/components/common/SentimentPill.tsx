import type { SentimentType } from '../../data/types/sentiment'
import styles from './SentimentPill.module.css'

const toneClass: Record<SentimentType, string> = {
  POSITIVE: styles.positive,
  NEGATIVE: styles.negative,
  NEUTRAL: styles.neutral,
}

const labels: Record<SentimentType, string> = {
  POSITIVE: '긍정',
  NEGATIVE: '부정',
  NEUTRAL: '중립',
}

export interface SentimentPillProps {
  sentiment: SentimentType
}

export function SentimentPill({ sentiment }: SentimentPillProps) {
  return (
    <span className={`${styles.pill} ${toneClass[sentiment]}`}>{labels[sentiment]}</span>
  )
}
