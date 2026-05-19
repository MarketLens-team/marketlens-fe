import type { EChartsOption } from 'echarts'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { formatStockScore } from './stockScore'
import { type StockChartColors, withAlpha } from './stockSentimentChartColors'
import { STOCK_SENTIMENT_ZONES } from './stockSentimentZones'

const BAND_STYLES: Array<{ y1: number; y2: number; colorKey: 'danger' | 'success' | 'textMuted'; opacity: number }> =
  [
    { y1: 60, y2: 100, colorKey: 'success', opacity: 0.32 },
    { y1: 20, y2: 60, colorKey: 'success', opacity: 0.14 },
    { y1: -20, y2: 20, colorKey: 'textMuted', opacity: 0.1 },
    { y1: -60, y2: -20, colorKey: 'danger', opacity: 0.14 },
    { y1: -100, y2: -60, colorKey: 'danger', opacity: 0.32 },
  ]

function formatAxisDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`
}

function zoneLabelGraphics(colors: StockChartColors): EChartsOption['graphic'] {
  return STOCK_SENTIMENT_ZONES.map((zone) => {
    const mid = (zone.y1 + zone.y2) / 2
    const topPct = ((100 - mid) / 200) * 100
    return {
      type: 'text',
      right: 10,
      top: `${topPct}%`,
      style: {
        text: zone.label,
        fill: colors.textMuted,
        fontSize: 11,
        fontFamily: 'Pretendard, sans-serif',
        textAlign: 'right',
      },
      silent: true,
    }
  })
}

function buildMarkAreaData(colors: StockChartColors) {
  return BAND_STYLES.map((band) => {
    const base = colors[band.colorKey]
    return [
      {
        yAxis: band.y1,
        itemStyle: { color: withAlpha(base, band.opacity) },
      },
      { yAxis: band.y2 },
    ] as [{ yAxis: number; itemStyle?: { color: string } }, { yAxis: number }]
  })
}

export function buildStockSentimentChartOption(
  trend: StockSentimentTrendPoint[],
  colors: StockChartColors,
  currentScore: number,
): EChartsOption {
  const dates = trend.map((p) => p.recordedAt)
  const scores = trend.map((p) => p.score)
  const mentions = trend.map((p) => p.mentionCount)
  const maxMention = Math.max(...mentions, 1)
  const mentionAxisMax = maxMention / 0.2
  const clampedCurrent = Math.min(100, Math.max(-100, currentScore))

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: 8, right: 68, top: 20, bottom: 28, containLabel: false },
    graphic: zoneLabelGraphics(colors),
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Pretendard, sans-serif',
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: withAlpha(colors.textSecondary, 0.35),
          width: 1,
        },
      },
      formatter: (raw) => {
        const items = (Array.isArray(raw) ? raw : [raw]) as Array<{
          axisValue?: string
          dataIndex?: number
        }>
        const idx = items[0]?.dataIndex ?? 0
        const row = trend[idx]
        if (!row) return ''
        const dateLabel = new Date(row.recordedAt).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        return [
          `<motion style="color:${colors.textMuted};font-size:12px;margin-bottom:6px;">${dateLabel}</motion>`,
          `<motion style="color:${colors.warning};font-size:14px;font-weight:700;">감성 ${formatStockScore(row.score)}</motion>`,
          `<motion style="color:${colors.textSecondary};font-size:13px;margin-top:6px;">언급량 ${row.mentionCount}건</motion>`,
        ].join('')
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.textMuted,
        fontSize: 11,
        fontFamily: 'IBM Plex Mono, monospace',
        formatter: (value: string) => formatAxisDate(value),
        interval: Math.max(0, Math.floor(dates.length / 6) - 1),
      },
    },
    yAxis: [
      {
        type: 'value',
        min: -100,
        max: 100,
        interval: 40,
        position: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: colors.textMuted,
          fontSize: 11,
          fontFamily: 'IBM Plex Mono, monospace',
          formatter: (v: number) => String(v),
        },
        splitLine: {
          lineStyle: {
            color: withAlpha(colors.textSecondary, 0.12),
            type: [6, 5],
          },
        },
      },
      {
        type: 'value',
        min: 0,
        max: mentionAxisMax,
        show: false,
      },
    ],
    series: [
      {
        name: '언급량',
        type: 'bar',
        yAxisIndex: 1,
        data: mentions,
        barMaxWidth: 10,
        itemStyle: {
          color: withAlpha(colors.textMuted, 0.4),
          borderRadius: [2, 2, 0, 0],
        },
        z: 1,
      },
      {
        name: '감성점수',
        type: 'line',
        yAxisIndex: 0,
        data: scores,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: colors.warning,
          width: 3,
        },
        areaStyle: {
          color: withAlpha(colors.warning, 0.18),
        },
        markArea: {
          silent: true,
          data: buildMarkAreaData(colors),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: colors.warning,
            width: 1,
            type: 'dashed',
          },
          label: {
            show: true,
            position: 'end',
            formatter: formatStockScore(clampedCurrent),
            color: colors.warning,
            fontWeight: 'bold',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
          },
          data: [{ yAxis: clampedCurrent }],
        },
        z: 3,
      },
    ],
  }
}
