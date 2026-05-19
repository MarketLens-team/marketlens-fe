import {
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  LineType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { formatStockScore } from './stockScore'
import { bandBackgroundColor, STOCK_SENTIMENT_BANDS } from './stockSentimentBands'
import {
  formatChartAxisPrice,
  readStockChartColors,
  withAlpha,
  type StockChartColors,
} from './stockSentimentChartColors'
import { buildSentimentLineSegments } from './stockSentimentLineSegments'
import {
  getSentimentInterpretation,
  getSentimentZoneLabel,
} from './stockSentimentInterpretation'
import { computeTooltipPosition } from './stockSentimentTooltip'
import { STOCK_SENTIMENT_ZONE_BOUNDARIES, STOCK_SENTIMENT_ZONES } from './stockSentimentZones'
import {
  maxMentionCount,
  toChartTime,
  trendToHistogramData,
} from './stockSentimentTrendChartData'
import styles from './StockSentimentTrendChart.module.css'

export interface StockSentimentTrendChartProps {
  trend: StockSentimentTrendPoint[]
  currentScore: number
}

interface TooltipState {
  left: number
  top: number
  dateLabel: string
  scoreLabel: string
  zoneLabel: string
  mentionLabel: string
  interpretation: string
}

const SCORE_MIN = -100
const SCORE_MAX = 100
const MENTION_SCALE_ID = 'mention'
const CHART_PERIODS = ['7일', '30일', '90일'] as const

function formatAxisDate(time: UTCTimestamp): string {
  const d = new Date(time * 1000)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function findTrendPoint(trend: StockSentimentTrendPoint[], time: UTCTimestamp) {
  return trend.find((p) => toChartTime(p.recordedAt) === time)
}

function buildChartOptions(colors: StockChartColors) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: colors.chartText,
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: {
        visible: true,
        color: colors.chartGrid,
        style: LineStyle.Dotted,
      },
    },
    rightPriceScale: {
      borderVisible: false,
      textColor: colors.chartText,
      scaleMargins: { top: 0.04, bottom: 0.12 },
      minimumWidth: 32,
      alignLabels: true,
    },
    timeScale: {
      borderVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
      timeVisible: false,
      secondsVisible: false,
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: withAlpha(colors.chartText, 0.4),
        width: 1,
        style: LineStyle.Solid,
        labelVisible: false,
      },
      horzLine: { visible: false },
    },
    localization: { locale: 'ko-KR' },
  } as const
}

function addBoundaryLines(series: ISeriesApi<'Line'>, colors: StockChartColors) {
  for (const price of STOCK_SENTIMENT_ZONE_BOUNDARIES) {
    series.createPriceLine({
      price,
      color: withAlpha(colors.chartText, 0.15),
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: false,
    })
  }
}

export function StockSentimentTrendChart({ trend, currentScore }: StockSentimentTrendChartProps) {
  const colors = useMemo(() => readStockChartColors(), [])
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const bandsLayerRef = useRef<HTMLDivElement>(null)
  const zoneLabelsLayerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const currentBadgeRef = useRef<HTMLDivElement>(null)
  const bandRefs = useRef<(HTMLDivElement | null)[]>([])
  const zoneLabelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const clampedCurrent = Math.min(SCORE_MAX, Math.max(SCORE_MIN, currentScore))
  const lineSegments = useMemo(() => buildSentimentLineSegments(trend), [trend])
  const histogramData = useMemo(() => trendToHistogramData(trend), [trend])
  const mentionMax = useMemo(() => maxMentionCount(trend), [trend])

  const syncOverlays = useCallback(() => {
    const series = mainSeriesRef.current
    const chart = chartRef.current
    if (!series || !chart) return

    const plotWidth = chart.timeScale().width()
    const rightScaleWidth = chart.priceScale('right').width()

    if (bandsLayerRef.current) {
      bandsLayerRef.current.style.width = `${plotWidth}px`
    }

    if (zoneLabelsLayerRef.current) {
      const labelRight = rightScaleWidth + 6
      zoneLabelsLayerRef.current.style.right = `${labelRight}px`
      zoneLabelsLayerRef.current.style.width = `${Math.min(72, plotWidth * 0.22)}px`
    }

    STOCK_SENTIMENT_BANDS.forEach((band, i) => {
      const el = bandRefs.current[i]
      if (!el) return
      const yTop = series.priceToCoordinate(band.y2)
      const yBottom = series.priceToCoordinate(band.y1)
      if (yTop == null || yBottom == null) return
      el.style.top = `${yTop}px`
      el.style.height = `${Math.max(0, yBottom - yTop)}px`
    })

    STOCK_SENTIMENT_ZONES.forEach((zone, i) => {
      const el = zoneLabelRefs.current[i]
      if (!el) return
      const mid = (zone.y1 + zone.y2) / 2
      const y = series.priceToCoordinate(mid)
      if (y == null) return
      el.style.top = `${y}px`
    })

    const badge = currentBadgeRef.current
    if (badge) {
      const y = series.priceToCoordinate(clampedCurrent)
      if (y != null) {
        badge.style.top = `${y}px`
        badge.style.right = `${rightScaleWidth + 4}px`
        badge.style.opacity = '1'
      }
    }
  }, [clampedCurrent])

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container || trend.length === 0) return

    const chart = createChart(container, {
      ...buildChartOptions(colors),
      width: container.clientWidth,
      height: container.clientHeight,
    })
    chartRef.current = chart

    const lineSeriesList: ISeriesApi<'Line'>[] = []

    lineSegments.forEach((segment, index) => {
      const lineSeries = chart.addSeries(LineSeries, {
        priceScaleId: 'right',
        color: segment.color,
        lineWidth: 4,
        lineType: LineType.Curved,
        crosshairMarkerVisible: index === lineSegments.length - 1,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: segment.color,
        crosshairMarkerBackgroundColor: 'transparent',
        lastValueVisible: false,
        priceLineVisible: false,
        autoscaleInfoProvider: () => ({
          priceRange: { minValue: SCORE_MIN, maxValue: SCORE_MAX },
        }),
      })
      lineSeries.setData(segment.data)
      lineSeriesList.push(lineSeries)
    })

    mainSeriesRef.current = lineSeriesList[0] ?? null
    if (mainSeriesRef.current) {
      addBoundaryLines(mainSeriesRef.current, colors)
    }

    const mentionAxisMax = mentionMax / 0.15
    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: MENTION_SCALE_ID,
      color: withAlpha(colors.chartText, 0.5),
      priceLineVisible: false,
      lastValueVisible: false,
      autoscaleInfoProvider: () => ({
        priceRange: { minValue: 0, maxValue: mentionAxisMax },
      }),
    })

    chart.priceScale(MENTION_SCALE_ID).applyOptions({
      scaleMargins: { top: 0.78, bottom: 0.02 },
      borderVisible: false,
      visible: false,
    })

    chart.applyOptions({
      localization: {
        locale: 'ko-KR',
        timeFormatter: (time: UTCTimestamp) => formatAxisDate(time),
        priceFormatter: formatChartAxisPrice,
      },
    })

    histogramSeries.setData(histogramData)
    chart.timeScale().fitContent()
    syncOverlays()

    const onCrosshair = (param: MouseEventParams) => {
      const chartArea = chartAreaRef.current
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0 || !chartArea) {
        setTooltip(null)
        return
      }

      const row = findTrendPoint(trend, param.time as UTCTimestamp)
      if (!row) {
        setTooltip(null)
        return
      }

      const { width, height } = chartArea.getBoundingClientRect()
      const pos = computeTooltipPosition(width, height, param.point.x, param.point.y)

      setTooltip({
        left: pos.left,
        top: pos.top,
        dateLabel: new Date(row.recordedAt).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        scoreLabel: formatStockScore(row.score),
        zoneLabel: getSentimentZoneLabel(row.score),
        mentionLabel: `${row.mentionCount.toLocaleString('ko-KR')}건`,
        interpretation: getSentimentInterpretation(row.score),
      })
    }

    chart.subscribeCrosshairMove(onCrosshair)

    const onVisibleRange = () => syncOverlays()
    chart.timeScale().subscribeVisibleLogicalRangeChange(onVisibleRange)

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth, height: container.clientHeight })
      syncOverlays()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.unsubscribeCrosshairMove(onCrosshair)
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onVisibleRange)
      chart.remove()
      chartRef.current = null
      mainSeriesRef.current = null
    }
  }, [trend, colors, lineSegments, histogramData, mentionMax, syncOverlays])

  useEffect(() => {
    syncOverlays()
  }, [syncOverlays, lineSegments, clampedCurrent])

  if (trend.length === 0) {
    return <p className={styles.empty}>표시할 추이 데이터가 없습니다.</p>
  }

  return (
    <div className={styles.root}>
      <div className={styles.chartHeader}>
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
        <div className={styles.periodGroup} role="group" aria-label="기간 선택">
          {CHART_PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              className={period === '30일' ? styles.periodActive : styles.periodBtn}
              disabled={period !== '30일'}
              aria-pressed={period === '30일'}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chartAreaRef}
        className={styles.chartArea}
        role="img"
        aria-label="30일 감성 점수 추이 차트"
      >
        <div ref={bandsLayerRef} className={styles.bands} aria-hidden>
          {STOCK_SENTIMENT_BANDS.map((band, i) => (
            <div
              key={band.tone}
              ref={(el) => {
                bandRefs.current[i] = el
              }}
              className={styles.band}
              style={{ backgroundColor: bandBackgroundColor(band) }}
            />
          ))}
        </div>

        <div ref={zoneLabelsLayerRef} className={styles.zoneLabels} aria-hidden>
          {STOCK_SENTIMENT_ZONES.map((zone, i) => (
            <span
              key={zone.label}
              ref={(el) => {
                zoneLabelRefs.current[i] = el
              }}
              className={styles.zoneLabel}
            >
              {zone.label}
            </span>
          ))}
        </div>

        <div ref={chartContainerRef} className={styles.chartCanvas} />

        <div ref={currentBadgeRef} className={styles.currentBadge} aria-hidden>
          {formatStockScore(clampedCurrent)}
        </div>

        {tooltip ? (
          <div className={styles.tooltip} style={{ left: tooltip.left, top: tooltip.top }}>
            <p className={styles.tooltipDate}>{tooltip.dateLabel}</p>
            <p className={styles.tooltipScore}>{tooltip.scoreLabel}</p>
            <p className={styles.tooltipZone}>{tooltip.zoneLabel}</p>
            <p className={styles.tooltipMention}>언급량 {tooltip.mentionLabel}</p>
            <p className={styles.tooltipInterpretation}>{tooltip.interpretation}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
