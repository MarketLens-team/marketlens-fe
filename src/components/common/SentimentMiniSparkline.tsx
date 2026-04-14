import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import type { SentimentTimelinePoint } from '../../data/types/dashboard'
import styles from './SentimentMiniSparkline.module.css'

export interface SentimentMiniSparklineProps {
  data: SentimentTimelinePoint[]
  /** 선 색: 미지정 시 마지막 점 부호로 G/R */
  strokeVar?: string
  className?: string
  /** 픽셀 높이 (모달 등에서 확대) */
  heightPx?: number
}

function strokeFromData(points: SentimentTimelinePoint[]): string {
  if (!points.length) return 'var(--t3)'
  const last = points[points.length - 1].score
  if (last > 0) return 'var(--G)'
  if (last < 0) return 'var(--R)'
  return 'var(--t2)'
}

export function SentimentMiniSparkline({ data, strokeVar, className, heightPx = 36 }: SentimentMiniSparklineProps) {
  const stroke = strokeVar ?? strokeFromData(data)
  if (!data.length) {
    return (
      <div
        className={`${styles.empty} ${className ?? ''}`}
        style={{ height: heightPx, minHeight: heightPx }}
        aria-hidden
      />
    )
  }
  return (
    <div
      className={`${styles.wrap} ${className ?? ''}`}
      style={{ height: heightPx, minHeight: heightPx }}
      role="img"
      aria-label="감성 추이 미니 차트"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <YAxis domain={['dataMin - 4', 'dataMax + 4']} hide />
          <Line type="monotone" dataKey="score" stroke={stroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
