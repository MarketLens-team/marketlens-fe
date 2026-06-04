import { Card } from '../common/Card'
import { AiSummaryText } from '../common/AiSummaryText'
import styles from './DashboardAiBrief.module.css'

interface DashboardAiBriefProps {
  summary: string
  updatedAt?: string | null
}

function formatBriefingUpdatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardAiBrief({ summary, updatedAt }: DashboardAiBriefProps) {
  const updatedLabel = updatedAt ? formatBriefingUpdatedAt(updatedAt) : ''

  return (
    <Card padding="lg" className={styles.card}>
      <div className={styles.header}>
        <p className={styles.label}>오늘 시장 요약</p>
        {updatedLabel ? <p className={styles.updated}>업데이트 {updatedLabel}</p> : null}
      </div>
      <p className={styles.text}>
        <AiSummaryText text={summary} />
      </p>
    </Card>
  )
}
