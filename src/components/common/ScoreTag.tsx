export interface ScoreTagProps {
  score: number
}

export function ScoreTag({ score }: ScoreTagProps) {
  const isPositive = score > 0
  const isNegative = score < 0
  const color = isPositive ? 'var(--G)' : isNegative ? 'var(--R)' : 'var(--t2)'
  const text =
    score === 0 ? '0' : isPositive ? `+${score}` : `${score}`

  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontWeight: 600,
        color,
      }}
    >
      {text}
    </span>
  )
}
