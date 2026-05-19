import { useId, useMemo } from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { formatStockScore } from './stockScore'
import {
  CHART_BACKGROUND_GRADIENT_STOPS,
  STOCK_SENTIMENT_ZONE_BOUNDARIES,
  STOCK_SENTIMENT_ZONES,
} from './stockSentimentZones'
import styles from './StockSentimentTrendChart.module.css'

const GRID_STROKE = 'color-mix(in srgb, var(--color-text-primary) 14%, transparent)'
const BOUNDARY_STROKE = 'color-mix(in srgb, var(--color-text-primary) 28%, transparent)'

export interface StockSentimentTrendChartProps {
  trend: StockSentimentTrendPoint[]
  currentScore: number
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`
}

function formatMentionCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

type TooltipPayload = {
  score?: number
  mentionCount?: number
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ payload?: TooltipPayload }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {label
          ? new Date(label).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </p>
      <p className={styles.tooltipScore}>감성 점수 {formatStockScore(row.score ?? 0)}</p>
      <p className={styles.tooltipMention}>언급량 {formatMentionCount(row.mentionCount ?? 0)}건</p>
    </div>
  )
}

function ChartGradientDefs({ bgId, areaId }: { bgId: string; areaId: string }) {
  return (
    <defs>
      <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
        {CHART_BACKGROUND_GRADIENT_STOPS.map((stop) => (
          <stop
            key={stop.offset}
            offset={stop.offset}
            stopColor={stop.color}
            stopOpacity={stop.opacity}
          />
        ))}
      </linearGradient>
      <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.45} />
        <stop offset="55%" stopColor="var(--color-warning)" stopOpacity={0.12} />
        <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

export function StockSentimentTrendChart({ trend, currentScore }: StockSentimentTrendChartProps) {
  const uid = useId().replace(/:/g, '')
  const bgGradientId = `stock-chart-bg-${uid}`
  const areaGradientId = `stock-chart-area-${uid}`

  const mentionAxisMax = useMemo(() => {
    const max = Math.max(...trend.map((p) => p.mentionCount), 1)
    return max / 0.2
  }, [trend])

  const clampedCurrent = Math.min(100, Math.max(-100, currentScore))

  if (trend.length === 0) {
    return <p className={styles.empty}>표시할 추이 데이터가 없습니다.</p>
  }

  return (
    <div className={styles.root}>
      <ul className={styles.legend} aria-hidden>
        <li className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotScore}`} />
          감성 점수
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotMention}`} />
          언급량
        </li>
      </ul>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trend}
            margin={{ top: 8, right: 56, left: 4, bottom: 4 }}
          >
            <ChartGradientDefs bgId={bgGradientId} areaId={areaGradientId} />
            <ReferenceArea
              yAxisId="score"
              y1={-100}
              y2={100}
              fill={`url(#${bgGradientId})`}
              strokeOpacity={0}
              ifOverflow="extendDomain"
            />
            {STOCK_SENTIMENT_ZONE_BOUNDARIES.map((y) => (
              <ReferenceLine
                key={y}
                yAxisId="score"
                y={y}
                stroke={BOUNDARY_STROKE}
                strokeDasharray="6 5"
                strokeWidth={1}
              />
            ))}
            {STOCK_SENTIMENT_ZONES.map((zone) => (
              <ReferenceLine
                key={`label-${zone.label}`}
                yAxisId="score"
                y={(zone.y1 + zone.y2) / 2}
                stroke="transparent"
                label={{
                  value: zone.label,
                  position: 'insideRight',
                  fill: 'var(--color-text-secondary)',
                  fontSize: 11,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            ))}
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="6 5" vertical={false} />
            <XAxis
              dataKey="at"
              tickFormatter={formatDayLabel}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              dy={4}
            />
            <YAxis
              yAxisId="score"
              orientation="right"
              domain={[-100, 100]}
              ticks={[-100, -60, -20, 20, 60, 100]}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <YAxis yAxisId="mention" domain={[0, mentionAxisMax]} hide />
            <ReferenceLine
              yAxisId="score"
              y={clampedCurrent}
              stroke="var(--color-warning)"
              strokeWidth={1}
              strokeDasharray="4 3"
              label={{
                value: formatStockScore(clampedCurrent),
                position: 'right',
                fill: 'var(--color-warning)',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{
                stroke: 'color-mix(in srgb, var(--color-text-primary) 35%, transparent)',
                strokeWidth: 1,
              }}
            />
            <Bar
              yAxisId="mention"
              dataKey="mentionCount"
              fill="color-mix(in srgb, var(--color-text-muted) 50%, transparent)"
              opacity={0.5}
              barSize={10}
              radius={[2, 2, 0, 0]}
            />
            <Area
              yAxisId="score"
              type="monotone"
              dataKey="score"
              baseLine={-100}
              stroke="var(--color-warning)"
              strokeWidth={3}
              fill={`url(#${areaGradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: 'var(--color-warning)',
                stroke: 'var(--color-bg-app)',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
