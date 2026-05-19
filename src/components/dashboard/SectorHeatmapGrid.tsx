import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SectorHeatmapCell } from '../../data/types/dashboard'
import styles from './SectorHeatmapGrid.module.css'

interface SectorHeatmapGridProps {
  cells: SectorHeatmapCell[]
}

function cellTone(score: number): 'pos' | 'neg' | 'neu' {
  if (score > 15) return 'pos'
  if (score < -5) return 'neg'
  return 'neu'
}

export function SectorHeatmapGrid({ cells }: SectorHeatmapGridProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader
        title="섹터 감성 히트맵"
        subtitle="섹터별 감성 · 언급 건수"
        variant="embedded"
        showChevron
      />
      <ul className={styles.grid}>
        {cells.map((cell) => {
          const tone = cellTone(cell.sentimentScore)
          return (
            <li key={cell.name} className={clsx(styles.cell, styles[tone])}>
              <span className={styles.cellName}>{cell.name}</span>
              <span className={styles.cellScore}>
                {cell.sentimentScore > 0 ? '+' : ''}
                {cell.sentimentScore}
              </span>
              <span className={styles.cellMentions}>{cell.mentionCount}건</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
