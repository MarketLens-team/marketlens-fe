import clsx from 'clsx'
import styles from './StatTile.module.css'

export type StatValueTone = 'default' | 'positive' | 'negative'

export interface StatTileProps {
  label: string
  value: string
  /** 등락률(%) — 양수 초록, 음수 빨강, 0은 보조색 */
  changePercent?: number | null
  hint?: string
  /** 주요 수치 색상 — 긍정/부정 강조 */
  valueTone?: StatValueTone
}

export function StatTile({ label, value, changePercent, hint, valueTone = 'default' }: StatTileProps) {
  let deltaClass = styles.flat
  let deltaText = ''
  if (changePercent != null) {
    if (changePercent > 0) {
      deltaClass = styles.up
      deltaText = `+${changePercent.toFixed(2)}%`
    } else if (changePercent < 0) {
      deltaClass = styles.down
      deltaText = `${changePercent.toFixed(2)}%`
    } else {
      deltaText = '0.00%'
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        <span
          className={clsx(
            styles.value,
            valueTone === 'positive' && styles.valuePositive,
            valueTone === 'negative' && styles.valueNegative,
          )}
        >
          {value}
        </span>
        {changePercent != null ? (
          <span className={clsx(styles.delta, deltaClass)}>{deltaText}</span>
        ) : null}
      </div>
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  )
}
