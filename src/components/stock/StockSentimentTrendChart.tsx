import * as echarts from 'echarts'
import { useEffect, useMemo, useRef } from 'react'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { buildStockSentimentChartOption } from './buildStockSentimentChartOption'
import { readStockChartColors } from './stockSentimentChartColors'
import styles from './StockSentimentTrendChart.module.css'

export interface StockSentimentTrendChartProps {
  trend: StockSentimentTrendPoint[]
  currentScore: number
}

export function StockSentimentTrendChart({ trend, currentScore }: StockSentimentTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  const colors = useMemo(() => readStockChartColors(), [])

  const option = useMemo(
    () => buildStockSentimentChartOption(trend, colors, currentScore),
    [trend, colors, currentScore],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    chartRef.current = echarts.init(el, undefined, { renderer: 'canvas' })

    const observer = new ResizeObserver(() => {
      chartRef.current?.resize()
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true })
  }, [option])

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
      <div ref={containerRef} className={styles.chartArea} role="img" aria-label="30일 감성 점수 추이 차트" />
    </div>
  )
}
