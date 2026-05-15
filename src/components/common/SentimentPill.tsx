import type { SentimentType } from '../../data/types/sentiment'

const styles: Record<
  SentimentType,
  { background: string; color: string; label: string }
> = {
  POSITIVE: {
    background: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
    color: 'var(--color-success)',
    label: '긍정',
  },
  NEGATIVE: {
    background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
    color: 'var(--color-danger)',
    label: '부정',
  },
  NEUTRAL: {
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    label: '중립',
  },
}

export interface SentimentPillProps {
  sentiment: SentimentType
}

export function SentimentPill({ sentiment }: SentimentPillProps) {
  const s = styles[sentiment]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 2,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        background: s.background,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}
