export interface ScoreTagProps {
  score: number
}

export function ScoreTag({ score }: ScoreTagProps) {
  const isPositive = score > 0
  const isNegative = score < 0
  const color = isPositive
    ? 'var(--color-success)'
    : isNegative
      ? 'var(--color-danger)'
      : 'var(--color-text-secondary)'
  const text =
    score === 0 ? '0' : isPositive ? `+${score}` : `${score}`

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color,
      }}
    >
      {text}
    </span>
  )
}
