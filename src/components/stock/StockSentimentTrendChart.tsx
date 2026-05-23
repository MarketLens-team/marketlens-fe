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
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { formatStockScore } from './stockScore'
import { bandBackgroundColor, STOCK_SENTIMENT_BANDS } from './stockSentimentBands'
import {
  formatChartAxisPrice,
  MENTION_HISTOGRAM_COLOR,
  readStockChartColors,
  SENTIMENT_ZONE_LINE_COLOR,
  withAlpha,
  type StockChartColors,
} from './stockSentimentChartColors'
import { buildSentimentLineSegments } from './stockSentimentLineSegments'
import {
  getSentimentInterpretation,
  getSentimentZoneLabel,
} from './stockSentimentInterpretation'
import { computeTooltipPosition } from './stockSentimentTooltip'
import {
  STOCK_SENTIMENT_ALL_BOUNDARIES,
  STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1,
  STOCK_SENTIMENT_Y_TICKS_DISPLAY_ORDER,
  STOCK_SENTIMENT_ZONES,
} from './stockSentimentZones'
import {
  maxMentionCount,
  toChartTime,
  trendToMentionHistogramData,
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
/** 우측 패널과 겹치지 않도록 플롯·툴팁 여백 */
const CHART_LAYOUT_PADDING_RIGHT = 20
const TOOLTIP_RIGHT_INSET = CHART_LAYOUT_PADDING_RIGHT + 8
/** lightweight-charts lineWidth: 1~4 (4가 최대) */
const SENTIMENT_SCORE_LINE_WIDTH = 2
type SeriesKey = 'score' | 'mention'

interface SeriesVisibility {
  score: boolean
  mention: boolean
}

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
      fontSize: 12,
      padding: { right: CHART_LAYOUT_PADDING_RIGHT },
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { visible: false },
    },
    rightPriceScale: {
      borderVisible: false,
      textColor: colors.chartText,
      autoScale: false,
      /* 상·하단 눈금이 점선 중앙에 오도록 최소 여백 */
      scaleMargins: { top: 0.05, bottom: 0.05 },
      minimumWidth: 32,
      alignLabels: true,
    },
    handleScroll: false,
    handleScale: false,
    kineticScroll: {
      touch: false,
      mouse: false,
    },
    timeScale: {
      borderVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
      lockVisibleTimeRangeOnResize: true,
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

function lockScorePriceScale(chart: IChartApi) {
  chart.priceScale('right').setVisibleRange({ from: SCORE_MIN, to: SCORE_MAX })
}

function addBoundaryLines(series: ISeriesApi<'Line'>) {
  for (const price of STOCK_SENTIMENT_ALL_BOUNDARIES) {
    series.createPriceLine({
      price,
      color: SENTIMENT_ZONE_LINE_COLOR,
      lineWidth: 2,
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
  const lineSeriesListRef = useRef<ISeriesApi<'Line'>[]>([])
  const histogramSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const currentBadgeRef = useRef<HTMLDivElement>(null)
  const axisTicksLayerRef = useRef<HTMLDivElement>(null)
  const axisTickRefs = useRef<(HTMLSpanElement | null)[]>([])
  const bandRefs = useRef<(HTMLDivElement | null)[]>([])
  const zoneLabelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [visibility, setVisibility] = useState<SeriesVisibility>({ score: true, mention: true })

  const clampedCurrent = Math.min(SCORE_MAX, Math.max(SCORE_MIN, currentScore))
  const lineSegments = useMemo(() => buildSentimentLineSegments(trend), [trend])
  const mentionMax = useMemo(() => maxMentionCount(trend), [trend])
  const histogramData = useMemo(
    () => trendToMentionHistogramData(trend, mentionMax),
    [trend, mentionMax],
  )

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
        badge.style.opacity = visibility.score ? '1' : '0'
      }
    }

    const axisInsetRight = 10
    if (axisTicksLayerRef.current) {
      axisTicksLayerRef.current.style.width = `${Math.max(rightScaleWidth - axisInsetRight, 24)}px`
      axisTicksLayerRef.current.style.right = `${axisInsetRight}px`
    }

    STOCK_SENTIMENT_Y_TICKS_DISPLAY_ORDER.forEach((value, i) => {
      const el = axisTickRefs.current[i]
      if (!el) return
      const y = series.priceToCoordinate(value)
      if (y == null) return
      el.style.top = `${y}px`
    })
  }, [clampedCurrent, visibility.score])

  const toggleSeries = (key: SeriesKey) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    lineSeriesListRef.current.forEach((s) => s.applyOptions({ visible: visibility.score }))
    histogramSeriesRef.current?.applyOptions({ visible: visibility.mention })
    syncOverlays()
  }, [visibility, syncOverlays])

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container || trend.length === 0) return

    const chart = createChart(container, {
      ...buildChartOptions(colors),
      width: container.clientWidth,
      height: container.clientHeight,
    })
    chartRef.current = chart

    lineSeriesListRef.current = []

    lineSegments.forEach((segment, index) => {
      const lineSeries = chart.addSeries(LineSeries, {
        priceScaleId: 'right',
        color: segment.color,
        lineWidth: SENTIMENT_SCORE_LINE_WIDTH,
        lineType: LineType.Simple,
        crosshairMarkerVisible: index === lineSegments.length - 1,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: segment.color,
        crosshairMarkerBackgroundColor: 'transparent',
        lastValueVisible: false,
        priceLineVisible: false,
        autoscaleInfoProvider: () => ({
          priceRange: { minValue: SCORE_MIN, maxValue: SCORE_MAX },
        }),
      })
      lineSeries.setData(segment.data)
      lineSeries.applyOptions({ visible: visibility.score })
      lineSeriesListRef.current.push(lineSeries)
    })

    mainSeriesRef.current = lineSeriesListRef.current[0] ?? null
    if (mainSeriesRef.current) {
      addBoundaryLines(mainSeriesRef.current)
    }

    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'right',
      color: MENTION_HISTOGRAM_COLOR,
      base: STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    histogramSeriesRef.current = histogramSeries

    chart.applyOptions({
      localization: {
        locale: 'ko-KR',
        timeFormatter: (time: UTCTimestamp) => formatAxisDate(time),
        priceFormatter: formatChartAxisPrice,
      },
    })

    histogramSeries.setData(histogramData)
    histogramSeries.applyOptions({ visible: visibility.mention })
    chart.timeScale().fitContent()
    lockScorePriceScale(chart)
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
      const pos = computeTooltipPosition(
        Math.max(0, width - TOOLTIP_RIGHT_INSET),
        height,
        param.point.x,
        param.point.y,
      )

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
      lockScorePriceScale(chart)
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
      lineSeriesListRef.current = []
      histogramSeriesRef.current = null
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
        <ul className={styles.legend} role="list">
          <li className={styles.legendItem}>
            <button
              type="button"
              className={clsx(styles.legendToggle, !visibility.score && styles.legendToggleOff)}
              aria-pressed={visibility.score}
              onClick={() => toggleSeries('score')}
            >
              <span className={`${styles.legendDot} ${styles.legendDotScore}`} />
              감성 점수
            </button>
          </li>
          <li className={styles.legendItem}>
            <button
              type="button"
              className={clsx(styles.legendToggle, !visibility.mention && styles.legendToggleOff)}
              aria-pressed={visibility.mention}
              onClick={() => toggleSeries('mention')}
            >
              <span className={`${styles.legendDot} ${styles.legendDotMention}`} />
              언급량
            </button>
          </li>
        </ul>
      </div>

      <div
        ref={chartAreaRef}
        className={styles.chartArea}
        role="img"
        aria-label="30일 감성 점수 추이 차트"
      >
        <div
          ref={bandsLayerRef}
          className={styles.bands}
          style={{ opacity: visibility.score ? 1 : 0 }}
          aria-hidden
        >
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

        <div ref={axisTicksLayerRef} className={styles.axisTicks} aria-hidden>
          {STOCK_SENTIMENT_Y_TICKS_DISPLAY_ORDER.map((value, i) => (
            <span
              key={value}
              ref={(el) => {
                axisTickRefs.current[i] = el
              }}
              className={`${styles.axisTick} ${styles.axisTickBelowLine}`}
            >
              {value}
            </span>
          ))}
        </div>

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
