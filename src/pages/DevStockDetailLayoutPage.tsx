import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PillButton } from '../components/ui/PillButton'
import { EntityAvatar } from '../components/ui/EntityAvatar'
import { StockHeaderAiSummary } from '../components/stock/StockHeaderAiSummary'
import { StockSentimentTrendChart } from '../components/stock/StockSentimentTrendChart'
import {
  formatPercent,
  formatPrice,
  formatStockScore,
  priceChangeDirection,
  stockSentimentTone,
} from '../components/stock/stockScore'
import {
  getSentimentInterpretation,
  getSentimentZoneLabel,
} from '../components/stock/stockSentimentInterpretation'
import {
  breakdownPercents,
  DEV_STOCK_LAYOUT_PREVIEW,
  trendToCandles,
  type DevIssueStreamItem,
  type DevStockLayoutPreview,
  type DevStockLayoutRelatedStock,
} from '../data/mocks/devStockDetailLayout.mock'
import styles from './DevStockDetailLayoutPage.module.css'

type TossTab = 'news' | 'related' | 'issue'

const LAYOUT_SECTIONS = [
  {
    id: 'layout-name-aside',
    title: 'L안 — 종목명 옆·아래',
    description: '메트릭 바 한 줄 · 아래 감성 분류 분포 · 차트',
    recommended: true,
  },
  {
    id: 'layout-toss',
    title: 'I안 — 토스형',
    description: '큰 가격·부드러운 카드·가로 메트릭·차트 후 탭(뉴스/연관/이슈)',
    recommended: true,
  },
  {
    id: 'layout-cmc',
    title: 'J안 — CMC형',
    description: '코인마켓캡식 4열 스탯 그리드·차트·테이블형 연관·뉴스',
    recommended: true,
  },
  {
    id: 'layout-defi',
    title: 'K안 — DeFi형',
    description: '대시보드 터미널·대형 인덱스·모노 스탯 그리드·패널 차트',
    recommended: true,
  },
  {
    id: 'layout-chart-first',
    title: 'F안 — 차트 퍼스트',
    description: '얇은 헤더 직후 차트 풀폭. 메타·뉴스·이슈는 차트 아래 2열',
    recommended: true,
  },
  {
    id: 'layout-chart-split',
    title: 'G안 — 차트 + 우측 고정',
    description: '차트 좌측 메인. 우측에 감성 결론·분포·연관종목. 하단 뉴스 밴드',
    recommended: true,
  },
  {
    id: 'layout-editorial',
    title: 'H안 — 에디토리얼',
    description: '헤드라인형 결론 → 차트 → 가로 스탯 · 이슈 타임라인 · 뉴스',
    recommended: true,
  },
  {
    id: 'layout-full',
    title: 'E안 — 전체 포함',
    description:
      '가격·관심종목·감성·AI 요약·핫 이슈·라인 차트·캔들·이슈 스트림·분포·연관종목·뉴스 전부',
    recommended: false,
  },
  {
    id: 'layout-minimal',
    title: 'D안 — 플랫',
    description: '카드·칩·사이드바 없음. 한 줄 결론 → 차트 풀폭 → 한 줄 메타 → 뉴스 3건',
    recommended: false,
  },
  {
    id: 'layout-stream',
    title: 'A안 — 캔들 + 이슈 스트림',
    description: '컴팩트 헤더·감성 캔들 차트·이슈 스트림(정적 목업)·오늘의 감성 사이드 카드',
    recommended: false,
  },
  {
    id: 'layout-hero',
    title: 'B안 — 히어로 + 추이 차트',
    description:
      '실제 `StockHeaderAiSummary`·`StockSentimentTrendChart` 사용. AI 핫 이슈 + 라인 차트 + 관련 뉴스',
    recommended: false,
  },
  {
    id: 'layout-focus',
    title: 'C안 — 감성 블록',
    description: '결론 카드 + 차트 + 레일. (C도 카드 느낌이라 별로일 수 있음)',
    recommended: false,
  },
] as const

function scoreToneClass(score: number) {
  const tone = stockSentimentTone(score)
  if (tone === 'positive') return styles.scoreUp
  if (tone === 'negative') return styles.scoreDown
  return styles.scoreNeutral
}

/** 모든 신규 안은 동일 라인 차트 사용 */
function DevChartBlock({
  data,
  className,
  tall = false,
  label = '30일 감성 추이',
}: {
  data: DevStockLayoutPreview
  className?: string
  tall?: boolean
  label?: string
}) {
  return (
    <section
      className={clsx(styles.devChartBlock, tall && styles.devChartBlockTall, className)}
      aria-label={label}
    >
      <StockSentimentTrendChart
        trend={data.sentimentContext.trend}
        currentScore={data.sentimentContext.current}
      />
    </section>
  )
}

function DevNewsList({ news, compact = false }: { news: DevStockLayoutPreview['news']; compact?: boolean }) {
  return (
    <ul className={clsx(styles.newsList, compact && styles.newsListCompact)}>
      {news.map((item) => (
        <li key={item.id} className={styles.newsItem}>
          <span className={clsx(styles.newsSentiment, newsSentimentClass(item.sentiment))}>
            {formatStockScore(item.sentimentScore)}
          </span>
          <div className={styles.newsBody}>
            <p className={styles.newsTitle}>{item.title}</p>
            {!compact ? (
              <p className={styles.newsMeta}>
                {item.source} ·{' '}
                {new Date(item.publishedAt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function DevIssueList({ items }: { items: DevIssueStreamItem[] }) {
  return (
    <ul className={styles.issueStream}>
      {items.map((item) => (
        <li key={item.id} className={styles.issueItem}>
          <span className={clsx(styles.issueDot, issueDotClass(item.sentiment))} aria-hidden />
          <span className={styles.issueTitle}>{item.title}</span>
          <time className={styles.issueTime}>{item.timeLabel}</time>
        </li>
      ))}
    </ul>
  )
}

function issueDotClass(sentiment: DevIssueStreamItem['sentiment']) {
  if (sentiment === 'positive') return styles.issueDotPos
  if (sentiment === 'negative') return styles.issueDotNeg
  return styles.issueDotNeu
}

function newsSentimentClass(sentiment: string) {
  if (sentiment === 'positive') return styles.newsSentimentPos
  if (sentiment === 'negative') return styles.newsSentimentNeg
  return styles.newsSentimentNeu
}

function SentimentCandleChart({ trend }: { trend: DevStockLayoutPreview['sentimentContext']['trend'] }) {
  const candles = useMemo(() => trendToCandles(trend), [trend])
  const maxMention = useMemo(
    () => Math.max(...candles.map((candle) => candle.mention), 1),
    [candles],
  )
  const yMin = -40
  const yMax = 100
  const chartWidth = 720
  const chartHeight = 200
  const volumeHeight = 48
  const paddingLeft = 44
  const paddingRight = 12

  const scoreToY = (score: number) => {
    const ratio = (score - yMin) / (yMax - yMin)
    return chartHeight - ratio * chartHeight
  }

  const candleSlot = (chartWidth - paddingLeft - paddingRight) / candles.length

  return (
    <div className={styles.candleChart}>
      <div className={styles.candleYAxis} aria-hidden>
        <span>극단 긍정 100</span>
        <span>긍정</span>
        <span>중립</span>
        <span>부정</span>
        <span>극단 부정 -40</span>
      </div>
      <div className={styles.candlePlot}>
        <svg
          className={styles.candleSvg}
          viewBox={`0 0 ${chartWidth} ${chartHeight + volumeHeight + 20}`}
          role="img"
          aria-label="30일 감성 캔들 차트"
        >
          {[100, 60, 20, -20, -40].map((level) => (
            <line
              key={level}
              x1={paddingLeft}
              y1={scoreToY(level)}
              x2={chartWidth - paddingRight}
              y2={scoreToY(level)}
              className={styles.candleGridLine}
            />
          ))}
          {candles.map((candle, index) => {
            const centerX = paddingLeft + candleSlot * index + candleSlot / 2
            const bodyTop = scoreToY(Math.max(candle.open, candle.close))
            const bodyBottom = scoreToY(Math.min(candle.open, candle.close))
            const bodyHeight = Math.max(bodyBottom - bodyTop, 2)
            const wickTop = scoreToY(candle.high)
            const wickBottom = scoreToY(candle.low)
            const volumeBarHeight = (candle.mention / maxMention) * volumeHeight
            const volumeY = chartHeight + 8 + (volumeHeight - volumeBarHeight)

            return (
              <g key={`${candle.dateLabel}-${index}`}>
                <line
                  x1={centerX}
                  y1={wickTop}
                  x2={centerX}
                  y2={wickBottom}
                  className={candle.bullish ? styles.candleWickUp : styles.candleWickDown}
                />
                <rect
                  x={centerX - candleSlot * 0.22}
                  y={bodyTop}
                  width={candleSlot * 0.44}
                  height={bodyHeight}
                  rx={1}
                  className={candle.bullish ? styles.candleBodyUp : styles.candleBodyDown}
                />
                <rect
                  x={centerX - candleSlot * 0.18}
                  y={volumeY}
                  width={candleSlot * 0.36}
                  height={volumeBarHeight}
                  rx={1}
                  className={candle.bullish ? styles.volumeBarUp : styles.volumeBarDown}
                />
              </g>
            )
          })}
        </svg>
        <div className={styles.candleXAxis} aria-hidden>
          {candles
            .filter((_, index) => index % 5 === 0 || index === candles.length - 1)
            .map((candle) => (
              <span key={candle.dateLabel}>{candle.dateLabel}</span>
            ))}
        </div>
      </div>
    </div>
  )
}

function BreakdownInline({ breakdown }: { breakdown: DevStockLayoutPreview['breakdown'] }) {
  const percents = breakdownPercents(breakdown)

  return (
    <div className={styles.breakdownInline}>
      <h3 className={styles.breakdownInlineTitle}>감성 분류 분포</h3>
      <div className={styles.stackedBar} role="img" aria-label="감성 분류 분포">
        <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
        <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
        <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
      </div>
      <ul className={styles.breakdownList}>
        <li>
          <span>긍정</span>
          <span className={styles.breakdownBadgePos}>{breakdown.positive}건</span>
        </li>
        <li>
          <span>중립</span>
          <span className={styles.breakdownBadgeNeu}>{breakdown.neutral}건</span>
        </li>
        <li>
          <span>부정</span>
          <span className={styles.breakdownBadgeNeg}>{breakdown.negative}건</span>
        </li>
      </ul>
    </div>
  )
}

function BreakdownPanel({ breakdown }: { breakdown: DevStockLayoutPreview['breakdown'] }) {
  return (
    <section className={styles.panel}>
      <BreakdownInline breakdown={breakdown} />
    </section>
  )
}

function RelatedStocksPanel({ stocks }: { stocks: DevStockLayoutRelatedStock[] }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>연관 종목</h3>
      <ul className={styles.relatedList}>
        {stocks.map((stock) => {
          const direction = priceChangeDirection(stock.changePercent)
          return (
            <li key={stock.code}>
              <EntityAvatar variant="stock" size="sm" name={stock.name} />
              <span className={styles.relatedName}>{stock.name}</span>
              <span className={styles.relatedTrailing}>
                <span className={styles.relatedPrice}>{formatPrice(stock.price)}</span>
                <span
                  className={clsx(
                    direction === 'up' && styles.scoreUp,
                    direction === 'down' && styles.scoreDown,
                  )}
                >
                  {formatPercent(stock.changePercent)}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function StreamLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, issueStream } = data
  const priceDirection = priceChangeDirection(stock.price.change)
  const percents = breakdownPercents(breakdown)

  return (
    <div className={styles.previewFrame}>
      <header className={styles.streamHeader}>
        <div className={styles.streamHeaderMain}>
          <div className={styles.streamTitleRow}>
            <EntityAvatar variant="stock" size="lg" name={stock.name} />
            <div>
              <h2 className={styles.stockName}>{stock.name}</h2>
              <p className={styles.stockMeta}>
                {stock.code} · {stock.market} · {stock.sector}
              </p>
            </div>
          </div>
          <div className={styles.streamPriceRow}>
            <span className={styles.streamPrice}>{formatPrice(stock.price.current)}</span>
            <span
              className={clsx(
                priceDirection === 'up' && styles.scoreUp,
                priceDirection === 'down' && styles.scoreDown,
              )}
            >
              {formatPercent(stock.price.changePercent)} ({formatPrice(stock.price.change)})
            </span>
          </div>
        </div>
        <div className={styles.streamHeaderStats}>
          <div className={styles.streamStat}>
            <span className={styles.streamStatLabel}>감성 점수</span>
            <span className={clsx(styles.streamStatValue, scoreToneClass(stock.sentimentScore))}>
              {formatStockScore(stock.sentimentScore)}
            </span>
          </div>
          <div className={styles.streamStat}>
            <span className={styles.streamStatLabel}>언급량 변화</span>
            <span className={clsx(styles.streamStatValue, styles.scoreUp)}>
              {formatPercent(stock.mentionChangePercent)}
            </span>
          </div>
          <div className={styles.streamStat}>
            <span className={styles.streamStatLabel}>30일 평균</span>
            <span className={clsx(styles.streamStatValue, scoreToneClass(sentimentContext.avg30d))}>
              {formatStockScore(sentimentContext.avg30d)}
            </span>
          </div>
          <div className={styles.streamStat}>
            <span className={styles.streamStatLabel}>30일 최고</span>
            <span className={clsx(styles.streamStatValue, scoreToneClass(sentimentContext.high30d))}>
              {formatStockScore(sentimentContext.high30d)}
            </span>
          </div>
        </div>
        <div className={styles.streamSentimentBarWrap}>
          <div className={styles.streamSentimentBar} role="img" aria-label="긍정·부정 분포">
            <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
            <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
            <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
          </div>
          <div className={styles.streamSentimentBarLabels}>
            <span className={styles.scoreUp}>긍정 {breakdown.positive}</span>
            <span className={styles.scoreDown}>부정 {breakdown.negative}</span>
          </div>
        </div>
      </header>

      <div className={styles.streamBody}>
        <div className={styles.streamMain}>
          <section className={styles.panel}>
            <div className={styles.panelHeadRow}>
              <div>
                <h3 className={styles.panelTitle}>30일 감성 추이 — 감성 캔들</h3>
                <p className={styles.panelSub}>최근 한 달 감성점수·언급량</p>
              </div>
            </div>
            <SentimentCandleChart trend={sentimentContext.trend} />
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>이슈 스트림</h3>
            <p className={styles.panelSub}>실시간 이슈 피드 (프리뷰용 정적 목록)</p>
            <ul className={styles.issueStream}>
              {issueStream.map((item) => (
                <li key={item.id} className={styles.issueItem}>
                  <span className={clsx(styles.issueDot, issueDotClass(item.sentiment))} aria-hidden />
                  <span className={styles.issueTitle}>{item.title}</span>
                  <time className={styles.issueTime}>{item.timeLabel}</time>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.streamAside}>
          <section className={clsx(styles.panel, styles.todayCard)}>
            <p className={styles.todayLabel}>오늘의 감성</p>
            <p className={clsx(styles.todayScore, scoreToneClass(stock.sentimentScore))}>
              {formatStockScore(stock.sentimentScore)}
            </p>
            <p className={styles.todayMentions}>
              {stock.mentionCount}건 언급 · {formatPercent(stock.mentionChangePercent)} 증가
            </p>
            <div className={styles.todayGrid}>
              <div>
                <span>30일 평균</span>
                <strong className={scoreToneClass(sentimentContext.avg30d)}>
                  {formatStockScore(sentimentContext.avg30d)}
                </strong>
              </div>
              <div>
                <span>30일 최고</span>
                <strong className={scoreToneClass(sentimentContext.high30d)}>
                  {formatStockScore(sentimentContext.high30d)}
                </strong>
              </div>
              <div>
                <span>30일 최저</span>
                <strong className={scoreToneClass(sentimentContext.low30d)}>
                  {formatStockScore(sentimentContext.low30d)}
                </strong>
              </div>
              <div>
                <span>변동성</span>
                <strong>±{sentimentContext.volatility}</strong>
              </div>
            </div>
          </section>
          <BreakdownPanel breakdown={breakdown} />
          <RelatedStocksPanel stocks={relatedStocks} />
        </aside>
      </div>
    </div>
  )
}

function HeroLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, news } = data
  const priceDirection = priceChangeDirection(stock.price.change)

  return (
    <div className={styles.previewFrame}>
      <header className={styles.heroHeader}>
        <div className={styles.heroHeaderTop}>
          <div className={styles.heroTitleRow}>
            <EntityAvatar variant="stock" size="xl" name={stock.name} />
            <h2 className={styles.stockName}>{stock.name}</h2>
          </div>
          <button type="button" className={styles.watchlistBtn} aria-pressed="true">
            <span aria-hidden>★</span> 관심종목
          </button>
        </div>
        <div className={styles.heroHeaderBody}>
          <div className={styles.heroLeft}>
            <p className={styles.stockMeta}>
              {stock.code} · {stock.market} · {stock.sector}
            </p>
            <div className={styles.heroPriceRow}>
              <span className={styles.heroPrice}>{formatPrice(stock.price.current)}</span>
              <span
                className={clsx(
                  priceDirection === 'up' && styles.scoreUp,
                  priceDirection === 'down' && styles.scoreDown,
                )}
              >
                {priceDirection === 'up' ? '+' : ''}
                {formatPrice(stock.price.change)} ({formatPercent(stock.price.changePercent)})
              </span>
            </div>
          </div>
          <div className={styles.heroMetrics}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>감성 점수</span>
              <span className={clsx(styles.heroStatValue, scoreToneClass(stock.sentimentScore))}>
                {formatStockScore(stock.sentimentScore)}
              </span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>언급량 변화율</span>
              <span className={clsx(styles.heroStatValue, styles.scoreUp)}>
                {formatPercent(stock.mentionChangePercent)}
              </span>
            </div>
            <StockHeaderAiSummary summary={stock.aiSummary} />
          </div>
        </div>
      </header>

      <div className={styles.heroMiddle}>
        <section className={styles.panel}>
          <div className={styles.panelHeadRow}>
            <div>
              <h3 className={styles.panelTitle}>30일 감성 추이</h3>
              <p className={styles.panelSub}>최근 한 달 감성점수 변화</p>
            </div>
            <div className={styles.trendStats}>
              <div>
                <span>30일 평균</span>
                <strong className={scoreToneClass(sentimentContext.avg30d)}>
                  {formatStockScore(sentimentContext.avg30d)}
                </strong>
              </div>
              <div>
                <span>30일 최고</span>
                <strong className={scoreToneClass(sentimentContext.high30d)}>
                  {formatStockScore(sentimentContext.high30d)}
                </strong>
              </div>
            </div>
          </div>
          <div className={styles.heroChartWrap}>
            <StockSentimentTrendChart
              trend={sentimentContext.trend}
              currentScore={sentimentContext.current}
            />
          </div>
        </section>

        <aside className={styles.heroAside}>
          <BreakdownPanel breakdown={breakdown} />
          <RelatedStocksPanel stocks={relatedStocks} />
        </aside>
      </div>

      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>관련 뉴스</h3>
        <p className={styles.panelSub}>프리뷰용 정적 목록 (실제 페이지는 무한 스크롤·필터)</p>
        <ul className={styles.newsList}>
          {news.map((item) => (
            <li key={item.id} className={styles.newsItem}>
              <span className={clsx(styles.newsSentiment, newsSentimentClass(item.sentiment))}>
                {formatStockScore(item.sentimentScore)}
              </span>
              <div className={styles.newsBody}>
                <p className={styles.newsTitle}>{item.title}</p>
                <p className={styles.newsMeta}>
                  {item.source} · {new Date(item.publishedAt).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function sentimentDominanceLabel(breakdown: DevStockLayoutPreview['breakdown']): string {
  const { positive, neutral, negative } = breakdown
  if (positive >= neutral && positive >= negative) return '긍정 우세'
  if (negative >= neutral && negative >= positive) return '부정 우세'
  return '중립 우세'
}

function sentimentDominanceBadgeClass(label: string) {
  if (label === '긍정 우세') return styles.metricBarBadgePos
  if (label === '부정 우세') return styles.metricBarBadgeNeg
  return styles.metricBarBadgeNeu
}

function NameAsideLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown } = data
  const priceDirection = priceChangeDirection(stock.price.change)
  const dominanceLabel = sentimentDominanceLabel(breakdown)

  return (
    <div className={styles.nameAsideFrame}>
      <header className={styles.nameAsideHeader}>
        <div className={styles.metricBar}>
          <div className={styles.metricBarIdentity}>
            <EntityAvatar variant="stock" size="lg" name={stock.name} />
            <div className={styles.metricBarIdentityText}>
              <div className={styles.metricBarNameRow}>
                <h2 className={styles.metricBarName}>{stock.name}</h2>
                <span className={styles.metricBarCode}>{stock.code}</span>
              </div>
              <p className={styles.metricBarMeta}>
                {stock.market} · {stock.sector}
              </p>
            </div>
          </div>

          <span className={styles.metricBarDivider} aria-hidden />

          <div className={styles.metricBarCol}>
            <span className={styles.metricBarLabel}>현재가</span>
            <span className={styles.metricBarValueRow}>
              <span className={styles.metricBarValue}>{formatPrice(stock.price.current)}</span>
              <span
                className={clsx(
                  styles.metricBarSubValue,
                  priceDirection === 'up' && styles.scoreUp,
                  priceDirection === 'down' && styles.scoreDown,
                )}
              >
                {formatPercent(stock.price.changePercent)}
              </span>
            </span>
          </div>

          <span className={styles.metricBarDivider} aria-hidden />

          <div className={styles.metricBarCol}>
            <span className={styles.metricBarLabel}>감성 점수</span>
            <span className={styles.metricBarValueRow}>
              <span className={clsx(styles.metricBarValue, scoreToneClass(stock.sentimentScore))}>
                {formatStockScore(stock.sentimentScore)}
              </span>
              <span className={clsx(styles.metricBarBadge, sentimentDominanceBadgeClass(dominanceLabel))}>
                {dominanceLabel}
              </span>
            </span>
          </div>

          <span className={styles.metricBarDivider} aria-hidden />

          <div className={styles.metricBarCol}>
            <span className={styles.metricBarLabel}>언급량</span>
            <span className={styles.metricBarValueRow}>
              <span className={styles.metricBarValue}>{stock.mentionCount}건</span>
              <span
                className={clsx(
                  styles.metricBarSubValue,
                  stock.mentionChangePercent >= 0 ? styles.scoreUp : styles.scoreDown,
                )}
              >
                {formatPercent(stock.mentionChangePercent)}
              </span>
            </span>
          </div>

          <span className={styles.metricBarDivider} aria-hidden />

          <div className={styles.metricBarCol}>
            <span className={styles.metricBarLabel}>30일 평균</span>
            <span
              className={clsx(styles.metricBarValue, scoreToneClass(sentimentContext.avg30d))}
            >
              {formatStockScore(sentimentContext.avg30d)}
            </span>
          </div>

          <button type="button" className={styles.metricBarWatchlist} aria-pressed="true">
            <span aria-hidden>★</span>
            <span>관심종목</span>
          </button>
        </div>

        <BreakdownInline breakdown={breakdown} />
      </header>

      <DevChartBlock data={data} tall />
    </div>
  )
}

function ChartFirstLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, issueStream, news, hotIssueBullets } =
    data
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)

  return (
    <div className={styles.chartFirstFrame}>
      <header className={styles.chartFirstHead}>
        <div className={styles.chartFirstIdentity}>
          <EntityAvatar variant="stock" size="sm" name={stock.name} />
          <span className={styles.chartFirstName}>{stock.name}</span>
          <span className={styles.chartFirstCode}>{stock.code}</span>
        </div>
        <div className={styles.chartFirstMetrics}>
          <span className={clsx(styles.chartFirstScore, scoreToneClass(stock.sentimentScore))}>
            {formatStockScore(stock.sentimentScore)}
          </span>
          <span className={styles.chartFirstMeta}>
            {zoneLabel} · 언급 {formatPercent(stock.mentionChangePercent)}
          </span>
        </div>
      </header>

      <DevChartBlock data={data} tall />

      <div className={styles.chartFirstBelow}>
        <div className={styles.chartFirstCol}>
          <section className={styles.chartFirstSection}>
            <h3 className={styles.chartFirstSectionTitle}>오늘 핫 이슈</h3>
            <ul className={styles.chartFirstBullets}>
              {hotIssueBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
          <section className={styles.chartFirstSection}>
            <h3 className={styles.chartFirstSectionTitle}>이슈 스트림</h3>
            <DevIssueList items={issueStream} />
          </section>
          <section className={styles.chartFirstSection}>
            <h3 className={styles.chartFirstSectionTitle}>관련 뉴스</h3>
            <DevNewsList news={news} />
          </section>
        </div>
        <aside className={styles.chartFirstAside}>
          <p className={styles.chartFirstAsideSummary}>{stock.aiSummary}</p>
          <div className={styles.chartFirstStatGrid}>
            <div>
              <span>30일 평균</span>
              <strong className={scoreToneClass(sentimentContext.avg30d)}>
                {formatStockScore(sentimentContext.avg30d)}
              </strong>
            </div>
            <div>
              <span>30일 최고</span>
              <strong className={scoreToneClass(sentimentContext.high30d)}>
                {formatStockScore(sentimentContext.high30d)}
              </strong>
            </div>
            <div>
              <span>30일 최저</span>
              <strong className={scoreToneClass(sentimentContext.low30d)}>
                {formatStockScore(sentimentContext.low30d)}
              </strong>
            </div>
            <div>
              <span>변동성</span>
              <strong>±{sentimentContext.volatility}</strong>
            </div>
          </div>
          <BreakdownPanel breakdown={breakdown} />
          <RelatedStocksPanel stocks={relatedStocks} />
        </aside>
      </div>
    </div>
  )
}

function ChartSplitLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, hotIssueBullets, news } = data
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)
  const interpretation = getSentimentInterpretation(stock.sentimentScore)
  const priceDirection = priceChangeDirection(stock.price.change)

  return (
    <div className={styles.chartSplitFrame}>
      <header className={styles.chartSplitTop}>
        <div>
          <h2 className={styles.stockName}>{stock.name}</h2>
          <p className={styles.stockMeta}>
            {stock.code} · {stock.market} · {formatPrice(stock.price.current)}
            <span
              className={clsx(
                priceDirection === 'up' && styles.scoreUp,
                priceDirection === 'down' && styles.scoreDown,
              )}
            >
              {' '}
              ({formatPercent(stock.price.changePercent)})
            </span>
          </p>
        </div>
        <StockHeaderAiSummary summary={stock.aiSummary} />
      </header>

      <div className={styles.chartSplitBody}>
        <DevChartBlock data={data} tall className={styles.chartSplitMain} />

        <aside className={styles.chartSplitAside}>
          <div className={styles.chartSplitVerdict}>
            <span className={styles.chartSplitVerdictLabel}>오늘 감성</span>
            <span className={clsx(styles.chartSplitVerdictScore, scoreToneClass(stock.sentimentScore))}>
              {formatStockScore(stock.sentimentScore)}
            </span>
            <p className={styles.chartSplitVerdictSub}>
              {zoneLabel} · {interpretation}
            </p>
            <p className={styles.chartSplitVerdictMention}>
              {stock.mentionCount}건 · {formatPercent(stock.mentionChangePercent)}
            </p>
          </div>
          <ul className={styles.chartSplitBullets}>
            {hotIssueBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className={styles.chartSplitMiniStats}>
            <span>평균 {formatStockScore(sentimentContext.avg30d)}</span>
            <span>최고 {formatStockScore(sentimentContext.high30d)}</span>
            <span>최저 {formatStockScore(sentimentContext.low30d)}</span>
          </div>
          <BreakdownPanel breakdown={breakdown} />
          <RelatedStocksPanel stocks={relatedStocks} />
        </aside>
      </div>

      <section className={styles.chartSplitNewsBand}>
        <h3 className={styles.panelTitle}>관련 뉴스</h3>
        <DevNewsList news={news} compact />
      </section>
    </div>
  )
}

function EditorialLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, issueStream, news, hotIssueBullets } =
    data
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)
  const percents = breakdownPercents(breakdown)

  return (
    <article className={styles.editorialFrame}>
      <header className={styles.editorialHead}>
        <p className={styles.editorialKicker}>
          {stock.market} · {stock.sector} · {stock.code}
        </p>
        <h2 className={styles.editorialHeadline}>
          {stock.name}, 오늘 감성은{' '}
          <span className={scoreToneClass(stock.sentimentScore)}>{zoneLabel}</span>
          {' '}
          <span className={clsx(styles.editorialHeadlineScore, scoreToneClass(stock.sentimentScore))}>
            ({formatStockScore(stock.sentimentScore)})
          </span>
        </h2>
        <p className={styles.editorialDeck}>{stock.aiSummary}</p>
        <ul className={styles.editorialDeckBullets}>
          {hotIssueBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </header>

      <DevChartBlock data={data} tall className={styles.editorialChart} />

      <div className={styles.editorialStatStrip}>
        <span>
          언급 <strong>{stock.mentionCount}건</strong> ({formatPercent(stock.mentionChangePercent)})
        </span>
        <span>
          30일 평균 <strong className={scoreToneClass(sentimentContext.avg30d)}>
            {formatStockScore(sentimentContext.avg30d)}
          </strong>
        </span>
        <span>
          최고 <strong className={scoreToneClass(sentimentContext.high30d)}>
            {formatStockScore(sentimentContext.high30d)}
          </strong>
        </span>
        <span>
          최저 <strong className={scoreToneClass(sentimentContext.low30d)}>
            {formatStockScore(sentimentContext.low30d)}
          </strong>
        </span>
        <span>
          분포{' '}
          <strong className={styles.scoreUp}>+{breakdown.positive}</strong> /{' '}
          <strong className={styles.scoreNeutral}>○{breakdown.neutral}</strong> /{' '}
          <strong className={styles.scoreDown}>-{breakdown.negative}</strong>
        </span>
      </div>

      <div className={styles.editorialBar} role="img" aria-label="감성 분류 분포">
        <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
        <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
        <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
      </div>

      <div className={styles.editorialBottom}>
        <section className={styles.editorialSection}>
          <h3 className={styles.chartFirstSectionTitle}>이슈 타임라인</h3>
          <DevIssueList items={issueStream} />
        </section>
        <section className={styles.editorialSection}>
          <h3 className={styles.chartFirstSectionTitle}>연관 종목</h3>
          <RelatedStocksPanel stocks={relatedStocks} />
        </section>
        <section className={clsx(styles.editorialSection, styles.editorialSectionWide)}>
          <h3 className={styles.chartFirstSectionTitle}>관련 뉴스</h3>
          <DevNewsList news={news} />
        </section>
      </div>
    </article>
  )
}

function TossLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, issueStream, news } = data
  const [tab, setTab] = useState<TossTab>('news')
  const priceDirection = priceChangeDirection(stock.price.change)
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)

  return (
    <div className={styles.tossFrame}>
      <header className={styles.tossHero}>
        <div className={styles.tossHeroTop}>
          <EntityAvatar variant="stock" size="lg" name={stock.name} />
          <div>
            <h2 className={styles.tossName}>{stock.name}</h2>
            <p className={styles.tossSub}>{stock.code} · {stock.market}</p>
          </div>
        </div>
        <p className={styles.tossPrice}>{formatPrice(stock.price.current)}</p>
        <p
          className={clsx(
            styles.tossPriceChange,
            priceDirection === 'up' && styles.scoreUp,
            priceDirection === 'down' && styles.scoreDown,
          )}
        >
          {priceDirection === 'up' ? '+' : ''}
          {formatPrice(stock.price.change)} ({formatPercent(stock.price.changePercent)})
        </p>
        <div className={styles.tossMetricScroll} role="list">
          <div className={styles.tossMetricPill} role="listitem">
            <span>감성</span>
            <strong className={scoreToneClass(stock.sentimentScore)}>
              {formatStockScore(stock.sentimentScore)}
            </strong>
          </div>
          <div className={styles.tossMetricPill} role="listitem">
            <span>언급</span>
            <strong>{stock.mentionCount}건</strong>
          </div>
          <div className={styles.tossMetricPill} role="listitem">
            <span>변화</span>
            <strong className={styles.scoreUp}>{formatPercent(stock.mentionChangePercent)}</strong>
          </div>
          <div className={styles.tossMetricPill} role="listitem">
            <span>30일 평균</span>
            <strong className={scoreToneClass(sentimentContext.avg30d)}>
              {formatStockScore(sentimentContext.avg30d)}
            </strong>
          </div>
        </div>
      </header>

      <div className={styles.tossBubble}>
        <p className={styles.tossBubbleLabel}>오늘의 한마디</p>
        <p className={styles.tossBubbleText}>{stock.aiSummary}</p>
        <p className={styles.tossBubbleMeta}>{zoneLabel} 구간이에요</p>
      </div>

      <div className={styles.tossChartCard}>
        <DevChartBlock data={data} />
      </div>

      <div className={styles.tossDistribution}>
        <span className={styles.scoreUp}>긍정 {breakdown.positive}</span>
        <span className={styles.scoreNeutral}>중립 {breakdown.neutral}</span>
        <span className={styles.scoreDown}>부정 {breakdown.negative}</span>
      </div>

      <div className={styles.tossTabs} role="tablist" aria-label="종목 상세 탭">
        {(
          [
            ['news', '뉴스'],
            ['related', '연관 종목'],
            ['issue', '이슈'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={clsx(styles.tossTab, tab === id && styles.tossTabActive)}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tossTabPanel} role="tabpanel">
        {tab === 'news' ? <DevNewsList news={news} /> : null}
        {tab === 'related' ? <RelatedStocksPanel stocks={relatedStocks} /> : null}
        {tab === 'issue' ? <DevIssueList items={issueStream} /> : null}
      </div>
    </div>
  )
}

function CmcLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, news } = data
  const priceDirection = priceChangeDirection(stock.price.change)
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)

  return (
    <div className={styles.cmcFrame}>
      <header className={styles.cmcHeader}>
        <div className={styles.cmcHeaderMain}>
          <EntityAvatar variant="stock" size="md" name={stock.name} />
          <div>
            <div className={styles.cmcTitleRow}>
              <h2 className={styles.cmcName}>{stock.name}</h2>
              <span className={styles.cmcSymbol}>{stock.code}</span>
            </div>
            <p className={styles.cmcRank}>#{1} in {stock.sector} · {stock.market}</p>
          </div>
        </div>
        <div className={styles.cmcPriceBlock}>
          <span className={styles.cmcPrice}>{formatPrice(stock.price.current)}</span>
          <span
            className={clsx(
              styles.cmcChange,
              priceDirection === 'up' && styles.cmcChangeUp,
              priceDirection === 'down' && styles.cmcChangeDown,
            )}
          >
            {formatPercent(stock.price.changePercent)}
          </span>
        </div>
      </header>

      <div className={styles.cmcStatGrid}>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Sentiment Score</span>
          <span className={clsx(styles.cmcStatValue, scoreToneClass(stock.sentimentScore))}>
            {formatStockScore(stock.sentimentScore)}
          </span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Mentions (24h)</span>
          <span className={styles.cmcStatValue}>{stock.mentionCount}</span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Mention Change</span>
          <span className={clsx(styles.cmcStatValue, styles.scoreUp)}>
            {formatPercent(stock.mentionChangePercent)}
          </span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>30d Avg</span>
          <span className={clsx(styles.cmcStatValue, scoreToneClass(sentimentContext.avg30d))}>
            {formatStockScore(sentimentContext.avg30d)}
          </span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>30d High</span>
          <span className={clsx(styles.cmcStatValue, scoreToneClass(sentimentContext.high30d))}>
            {formatStockScore(sentimentContext.high30d)}
          </span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Sentiment Zone</span>
          <span className={styles.cmcStatValue}>{zoneLabel}</span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Positive</span>
          <span className={clsx(styles.cmcStatValue, styles.scoreUp)}>{breakdown.positive}</span>
        </div>
        <div className={styles.cmcStatCell}>
          <span className={styles.cmcStatLabel}>Negative</span>
          <span className={clsx(styles.cmcStatValue, styles.scoreDown)}>{breakdown.negative}</span>
        </div>
      </div>

      <p className={styles.cmcSummary}>{stock.aiSummary}</p>

      <section className={styles.cmcChartSection}>
        <h3 className={styles.cmcSectionTitle}>Chart</h3>
        <DevChartBlock data={data} tall />
      </section>

      <section className={styles.cmcTableSection}>
        <h3 className={styles.cmcSectionTitle}>Related Stocks</h3>
        <table className={styles.cmcTable}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">24h</th>
            </tr>
          </thead>
          <tbody>
            {relatedStocks.map((related, index) => {
              const direction = priceChangeDirection(related.changePercent)
              return (
                <tr key={related.code}>
                  <td>{index + 1}</td>
                  <td>{related.name}</td>
                  <td className={styles.cmcMono}>{formatPrice(related.price)}</td>
                  <td
                    className={clsx(
                      styles.cmcMono,
                      direction === 'up' && styles.scoreUp,
                      direction === 'down' && styles.scoreDown,
                    )}
                  >
                    {formatPercent(related.changePercent)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.cmcTableSection}>
        <h3 className={styles.cmcSectionTitle}>News</h3>
        <table className={styles.cmcTable}>
          <thead>
            <tr>
              <th scope="col">Score</th>
              <th scope="col">Title</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id}>
                <td
                  className={clsx(
                    styles.cmcMono,
                    newsSentimentClass(item.sentiment),
                  )}
                >
                  {formatStockScore(item.sentimentScore)}
                </td>
                <td>{item.title}</td>
                <td className={styles.cmcMuted}>{item.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function DefiLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, issueStream, news } = data
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)
  const percents = breakdownPercents(breakdown)

  return (
    <div className={styles.defiFrame}>
      <header className={styles.defiHeader}>
        <div className={styles.defiProtocol}>
          <EntityAvatar variant="stock" size="sm" name={stock.name} />
          <div>
            <p className={styles.defiProtocolLabel}>SENTIMENT PROTOCOL</p>
            <h2 className={styles.defiProtocolName}>{stock.name}</h2>
            <p className={styles.defiProtocolMeta}>{stock.code} · {stock.market} · {stock.sector}</p>
          </div>
        </div>
        <div className={styles.defiIndex}>
          <span className={styles.defiIndexLabel}>SENTIMENT INDEX</span>
          <span className={clsx(styles.defiIndexValue, scoreToneClass(stock.sentimentScore))}>
            {formatStockScore(stock.sentimentScore)}
          </span>
          <span className={styles.defiIndexZone}>{zoneLabel}</span>
        </div>
      </header>

      <div className={styles.defiGrid}>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>MENTIONS</span>
          <span className={styles.defiCellValue}>{stock.mentionCount}</span>
          <span className={clsx(styles.defiCellDelta, styles.scoreUp)}>
            {formatPercent(stock.mentionChangePercent)}
          </span>
        </div>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>30D AVG</span>
          <span className={clsx(styles.defiCellValue, scoreToneClass(sentimentContext.avg30d))}>
            {formatStockScore(sentimentContext.avg30d)}
          </span>
        </div>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>30D HIGH</span>
          <span className={clsx(styles.defiCellValue, scoreToneClass(sentimentContext.high30d))}>
            {formatStockScore(sentimentContext.high30d)}
          </span>
        </div>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>30D LOW</span>
          <span className={clsx(styles.defiCellValue, scoreToneClass(sentimentContext.low30d))}>
            {formatStockScore(sentimentContext.low30d)}
          </span>
        </div>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>VOLATILITY</span>
          <span className={styles.defiCellValue}>±{sentimentContext.volatility}</span>
        </div>
        <div className={styles.defiCell}>
          <span className={styles.defiCellLabel}>PRICE</span>
          <span className={styles.defiCellValue}>{formatPrice(stock.price.current)}</span>
        </div>
      </div>

      <div className={styles.defiPanel}>
        <div className={styles.defiPanelHead}>
          <span className={styles.defiPanelTitle}>ANALYTICS · 30D</span>
          <span className={styles.defiPanelMeta}>
            POS {percents.positive}% · NEU {percents.neutral}% · NEG {percents.negative}%
          </span>
        </div>
        <DevChartBlock data={data} tall />
      </div>

      <div className={styles.defiSplit}>
        <section className={styles.defiPanel}>
          <p className={styles.defiPanelTitle}>POOL COMPOSITION</p>
          <div className={styles.defiPoolBar} role="img" aria-label="감성 분포">
            <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
            <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
            <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
          </div>
          <p className={styles.defiPoolCounts}>
            +{breakdown.positive} / ○{breakdown.neutral} / -{breakdown.negative}
          </p>
          <p className={styles.defiSummary}>{stock.aiSummary}</p>
        </section>

        <section className={styles.defiPanel}>
          <p className={styles.defiPanelTitle}>CORRELATED PAIRS</p>
          <ul className={styles.defiPairs}>
            {relatedStocks.map((related) => {
              const direction = priceChangeDirection(related.changePercent)
              return (
                <li key={related.code}>
                  <span>{related.name}</span>
                  <span className={styles.defiPairRight}>
                    <span className={styles.defiMono}>{formatPrice(related.price)}</span>
                    <span
                      className={clsx(
                        direction === 'up' && styles.scoreUp,
                        direction === 'down' && styles.scoreDown,
                      )}
                    >
                      {formatPercent(related.changePercent)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section className={styles.defiPanel}>
        <p className={styles.defiPanelTitle}>FEED · ISSUES & NEWS</p>
        <DevIssueList items={issueStream.slice(0, 3)} />
        <DevNewsList news={news} compact />
      </section>
    </div>
  )
}

function FullLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const {
    stock,
    sentimentContext,
    breakdown,
    relatedStocks,
    hotIssueBullets,
    issueStream,
    news,
  } = data
  const priceDirection = priceChangeDirection(stock.price.change)
  const percents = breakdownPercents(breakdown)
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)

  return (
    <div className={styles.previewFrame}>
      <header className={styles.heroHeader}>
        <div className={styles.heroHeaderTop}>
          <div className={styles.heroTitleRow}>
            <EntityAvatar variant="stock" size="xl" name={stock.name} />
            <div>
              <h2 className={styles.stockName}>{stock.name}</h2>
              <p className={styles.stockMeta}>
                {stock.code} · {stock.market} · {stock.sector}
              </p>
            </div>
          </div>
          <button type="button" className={styles.watchlistBtn} aria-pressed="true">
            <span aria-hidden>★</span> 관심종목
          </button>
        </div>
        <div className={styles.heroHeaderBody}>
          <div className={styles.heroLeft}>
            <div className={styles.heroPriceRow}>
              <span className={styles.heroPrice}>{formatPrice(stock.price.current)}</span>
              <span
                className={clsx(
                  priceDirection === 'up' && styles.scoreUp,
                  priceDirection === 'down' && styles.scoreDown,
                )}
              >
                {priceDirection === 'up' ? '+' : ''}
                {formatPrice(stock.price.change)} ({formatPercent(stock.price.changePercent)})
              </span>
            </div>
          </div>
          <div className={styles.heroMetrics}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>감성 점수</span>
              <span className={clsx(styles.heroStatValue, scoreToneClass(stock.sentimentScore))}>
                {formatStockScore(stock.sentimentScore)}
              </span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>언급량 변화율</span>
              <span className={clsx(styles.heroStatValue, styles.scoreUp)}>
                {formatPercent(stock.mentionChangePercent)}
              </span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>오늘 언급</span>
              <span className={styles.heroStatValue}>{stock.mentionCount}건</span>
            </div>
          </div>
        </div>
        <div className={styles.streamSentimentBarWrap}>
          <div className={styles.streamSentimentBar} role="img" aria-label="감성 분류 분포">
            <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
            <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
            <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
          </div>
          <div className={styles.streamSentimentBarLabels}>
            <span className={styles.scoreUp}>긍정 {breakdown.positive}</span>
            <span className={styles.scoreNeutral}>{zoneLabel}</span>
            <span className={styles.scoreDown}>부정 {breakdown.negative}</span>
          </div>
        </div>
      </header>

      <div className={styles.fullSummaryRow}>
        <StockHeaderAiSummary summary={stock.aiSummary} />
        <div className={styles.todayGrid}>
          <div>
            <span>30일 평균</span>
            <strong className={scoreToneClass(sentimentContext.avg30d)}>
              {formatStockScore(sentimentContext.avg30d)}
            </strong>
          </div>
          <div>
            <span>30일 최고</span>
            <strong className={scoreToneClass(sentimentContext.high30d)}>
              {formatStockScore(sentimentContext.high30d)}
            </strong>
          </div>
          <div>
            <span>30일 최저</span>
            <strong className={scoreToneClass(sentimentContext.low30d)}>
              {formatStockScore(sentimentContext.low30d)}
            </strong>
          </div>
          <div>
            <span>변동성</span>
            <strong>±{sentimentContext.volatility}</strong>
          </div>
        </div>
      </div>

      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>오늘 핫 이슈</h3>
        <ul className={styles.focusBullets}>
          {hotIssueBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <div className={styles.streamBody}>
        <div className={styles.streamMain}>
          <section className={styles.panel}>
            <div className={styles.panelHeadRow}>
              <div>
                <h3 className={styles.panelTitle}>30일 감성 추이</h3>
                <p className={styles.panelSub}>라인 차트 · 언급량</p>
              </div>
            </div>
            <div className={styles.heroChartWrap}>
              <StockSentimentTrendChart
                trend={sentimentContext.trend}
                currentScore={sentimentContext.current}
              />
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>30일 감성 캔들</h3>
            <p className={styles.panelSub}>감성 OHLC 목업</p>
            <SentimentCandleChart trend={sentimentContext.trend} />
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>이슈 스트림</h3>
            <p className={styles.panelSub}>프리뷰용 정적 목록</p>
            <ul className={styles.issueStream}>
              {issueStream.map((item) => (
                <li key={item.id} className={styles.issueItem}>
                  <span className={clsx(styles.issueDot, issueDotClass(item.sentiment))} aria-hidden />
                  <span className={styles.issueTitle}>{item.title}</span>
                  <time className={styles.issueTime}>{item.timeLabel}</time>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>관련 뉴스</h3>
            <p className={styles.panelSub}>전체 목록</p>
            <ul className={styles.newsList}>
              {news.map((item) => (
                <li key={item.id} className={styles.newsItem}>
                  <span className={clsx(styles.newsSentiment, newsSentimentClass(item.sentiment))}>
                    {formatStockScore(item.sentimentScore)}
                  </span>
                  <div className={styles.newsBody}>
                    <p className={styles.newsTitle}>{item.title}</p>
                    <p className={styles.newsMeta}>
                      {item.source} ·{' '}
                      {new Date(item.publishedAt).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.streamAside}>
          <section className={clsx(styles.panel, styles.todayCard)}>
            <p className={styles.todayLabel}>오늘의 감성</p>
            <p className={clsx(styles.todayScore, scoreToneClass(stock.sentimentScore))}>
              {formatStockScore(stock.sentimentScore)}
            </p>
            <p className={styles.todayMentions}>
              {stock.mentionCount}건 언급 · {formatPercent(stock.mentionChangePercent)} 증가
            </p>
          </section>
          <BreakdownPanel breakdown={breakdown} />
          <RelatedStocksPanel stocks={relatedStocks} />
        </aside>
      </div>
    </div>
  )
}

function MinimalLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, news } = data
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)
  const topNews = news.slice(0, 3)

  return (
    <article className={styles.minimalFrame}>
      <header className={styles.minimalHead}>
        <div className={styles.minimalHeadRow}>
          <h2 className={styles.minimalTitle}>
            {stock.name}
            <span className={clsx(styles.minimalScore, scoreToneClass(stock.sentimentScore))}>
              {formatStockScore(stock.sentimentScore)}
            </span>
          </h2>
          <span className={styles.minimalCode}>{stock.code}</span>
        </div>
        <p className={styles.minimalLead}>
          <span className={scoreToneClass(stock.sentimentScore)}>{zoneLabel}</span>
          {' · '}
          언급 {stock.mentionCount}건 ({formatPercent(stock.mentionChangePercent)})
          {' · '}
          30일 평균 {formatStockScore(sentimentContext.avg30d)}
        </p>
        <p className={styles.minimalSummary}>{stock.aiSummary}</p>
      </header>

      <div className={styles.minimalChart}>
        <StockSentimentTrendChart
          trend={sentimentContext.trend}
          currentScore={sentimentContext.current}
        />
      </div>

      <footer className={styles.minimalFoot}>
        <p className={styles.minimalMeta}>
          <span className={styles.scoreUp}>긍정 {breakdown.positive}</span>
          <span aria-hidden> · </span>
          <span className={styles.scoreNeutral}>중립 {breakdown.neutral}</span>
          <span aria-hidden> · </span>
          <span className={styles.scoreDown}>부정 {breakdown.negative}</span>
          <span className={styles.minimalMetaSep} aria-hidden>
            |
          </span>
          {relatedStocks.map((related, index) => {
            const direction = priceChangeDirection(related.changePercent)
            return (
              <span key={related.code}>
                {index > 0 ? ' · ' : null}
                {related.name}{' '}
                <span
                  className={clsx(
                    styles.minimalRelatedChange,
                    direction === 'up' && styles.scoreUp,
                    direction === 'down' && styles.scoreDown,
                  )}
                >
                  {formatPercent(related.changePercent)}
                </span>
              </span>
            )
          })}
        </p>
      </footer>

      <section className={styles.minimalNews} aria-label="관련 뉴스">
        <h3 className={styles.minimalNewsLabel}>근거 뉴스</h3>
        <ul className={styles.minimalNewsList}>
          {topNews.map((item) => (
            <li key={item.id}>
              <span className={clsx(styles.minimalNewsScore, newsSentimentClass(item.sentiment))}>
                {formatStockScore(item.sentimentScore)}
              </span>
              <span className={styles.minimalNewsTitle}>{item.title}</span>
            </li>
          ))}
        </ul>
        {news.length > topNews.length ? (
          <p className={styles.minimalNewsMore}>외 {news.length - topNews.length}건</p>
        ) : null}
      </section>
    </article>
  )
}

function FocusLayoutPreview({ data }: { data: DevStockLayoutPreview }) {
  const { stock, sentimentContext, breakdown, relatedStocks, hotIssueBullets, news } = data
  const [newsOpen, setNewsOpen] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const percents = breakdownPercents(breakdown)
  const priceDirection = priceChangeDirection(stock.price.change)
  const zoneLabel = getSentimentZoneLabel(stock.sentimentScore)
  const interpretation = getSentimentInterpretation(stock.sentimentScore)

  return (
    <div className={styles.focusFrame}>
      <div className={styles.focusTopBar}>
        <div className={styles.focusIdentity}>
          <EntityAvatar variant="stock" size="md" name={stock.name} />
          <div>
            <h2 className={styles.focusStockName}>{stock.name}</h2>
            <p className={styles.stockMeta}>
              {stock.code} · {stock.market} · {stock.sector}
            </p>
          </div>
        </div>
        <div className={styles.focusTopActions}>
          <PillButton
            variant="ghost"
            className={styles.focusPriceToggle}
            aria-pressed={showPrice}
            onClick={() => setShowPrice((prev) => !prev)}
          >
            {showPrice ? '가격 숨기기' : '가격 보기'}
          </PillButton>
          <button type="button" className={styles.focusWatchlist} aria-pressed="true">
            <span aria-hidden>★</span>
          </button>
        </div>
      </div>

      {showPrice ? (
        <p className={styles.focusPriceLine}>
          <span className={styles.focusPriceValue}>{formatPrice(stock.price.current)}</span>
          <span
            className={clsx(
              priceDirection === 'up' && styles.scoreUp,
              priceDirection === 'down' && styles.scoreDown,
            )}
          >
            {priceDirection === 'up' ? '+' : ''}
            {formatPrice(stock.price.change)} ({formatPercent(stock.price.changePercent)})
          </span>
        </p>
      ) : null}

      <section className={styles.focusVerdict} aria-label="오늘 감성 결론">
        <div className={styles.focusVerdictMain}>
          <p className={styles.focusVerdictLabel}>오늘 감성</p>
          <p className={clsx(styles.focusVerdictScore, scoreToneClass(stock.sentimentScore))}>
            {formatStockScore(stock.sentimentScore)}
          </p>
          <p className={styles.focusVerdictZone}>{zoneLabel} · {interpretation}</p>
        </div>
        <div className={styles.focusChips}>
          <span className={styles.focusChip}>
            언급 <strong>{stock.mentionCount}건</strong>
          </span>
          <span className={clsx(styles.focusChip, styles.focusChipUp)}>
            변화율 <strong>{formatPercent(stock.mentionChangePercent)}</strong>
          </span>
          <span className={styles.focusChip}>
            30일 평균 <strong className={scoreToneClass(sentimentContext.avg30d)}>
              {formatStockScore(sentimentContext.avg30d)}
            </strong>
          </span>
        </div>
        <ul className={styles.focusBullets}>
          {hotIssueBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <PillButton
          variant="ghost"
          className={styles.focusNewsToggle}
          aria-expanded={newsOpen}
          onClick={() => setNewsOpen((prev) => !prev)}
        >
          {newsOpen ? '근거 뉴스 접기' : `관련 뉴스 ${news.length}건 보기`}
        </PillButton>
      </section>

      <section className={styles.focusChartSection} aria-labelledby="focus-chart-title">
        <div className={styles.focusChartHead}>
          <div>
            <h3 id="focus-chart-title" className={styles.focusChartTitle}>
              30일 감성 추이
            </h3>
            <p className={styles.focusChartSub}>
              30일 최고 {formatStockScore(sentimentContext.high30d)} · 최저{' '}
              {formatStockScore(sentimentContext.low30d)}
            </p>
          </div>
        </div>
        <div className={styles.focusChartBody}>
          <div className={styles.focusChartMain}>
            <StockSentimentTrendChart
              trend={sentimentContext.trend}
              currentScore={sentimentContext.current}
            />
          </div>
          <aside className={styles.focusChartRail} aria-label="오늘 분포·연관 종목">
            <div className={styles.focusRailBlock}>
              <p className={styles.focusRailLabel}>오늘 분포</p>
              <div className={styles.stackedBar} role="img" aria-label="감성 분류 분포">
                <span className={styles.barPos} style={{ width: `${percents.positive}%` }} />
                <span className={styles.barNeu} style={{ width: `${percents.neutral}%` }} />
                <span className={styles.barNeg} style={{ width: `${percents.negative}%` }} />
              </div>
              <div className={styles.focusRailCounts}>
                <span className={styles.scoreUp}>+{breakdown.positive}</span>
                <span className={styles.scoreNeutral}>○{breakdown.neutral}</span>
                <span className={styles.scoreDown}>-{breakdown.negative}</span>
              </div>
            </div>
            <div className={styles.focusRailBlock}>
              <p className={styles.focusRailLabel}>연관 종목</p>
              <ul className={styles.focusRelatedChips}>
                {relatedStocks.map((related) => {
                  const direction = priceChangeDirection(related.changePercent)
                  return (
                    <li key={related.code}>
                      <span className={styles.focusRelatedName}>{related.name}</span>
                      <span
                        className={clsx(
                          styles.focusRelatedChange,
                          direction === 'up' && styles.scoreUp,
                          direction === 'down' && styles.scoreDown,
                        )}
                      >
                        {formatPercent(related.changePercent)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {newsOpen ? (
        <section className={styles.focusNewsPanel} aria-label="관련 뉴스 근거">
          <ul className={styles.newsList}>
            {news.map((item) => (
              <li key={item.id} className={styles.newsItem}>
                <span className={clsx(styles.newsSentiment, newsSentimentClass(item.sentiment))}>
                  {formatStockScore(item.sentimentScore)}
                </span>
                <div className={styles.newsBody}>
                  <p className={styles.newsTitle}>{item.title}</p>
                  <p className={styles.newsMeta}>
                    {item.source} ·{' '}
                    {new Date(item.publishedAt).toLocaleString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function renderLayoutPreview(sectionId: string, data: DevStockLayoutPreview) {
  switch (sectionId) {
    case 'layout-name-aside':
      return <NameAsideLayoutPreview data={data} />
    case 'layout-toss':
      return <TossLayoutPreview data={data} />
    case 'layout-cmc':
      return <CmcLayoutPreview data={data} />
    case 'layout-defi':
      return <DefiLayoutPreview data={data} />
    case 'layout-chart-first':
      return <ChartFirstLayoutPreview data={data} />
    case 'layout-chart-split':
      return <ChartSplitLayoutPreview data={data} />
    case 'layout-editorial':
      return <EditorialLayoutPreview data={data} />
    case 'layout-full':
      return <FullLayoutPreview data={data} />
    case 'layout-minimal':
      return <MinimalLayoutPreview data={data} />
    case 'layout-stream':
      return <StreamLayoutPreview data={data} />
    case 'layout-hero':
      return <HeroLayoutPreview data={data} />
    case 'layout-focus':
      return <FocusLayoutPreview data={data} />
    default:
      return null
  }
}

export default function DevStockDetailLayoutPage() {
  const data = DEV_STOCK_LAYOUT_PREVIEW

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>종목 상세 레이아웃 비교</h1>
            <p className={styles.topbarDesc}>
              L안: 메트릭 바 · 감성 분류 분포 · 라인 차트.
            </p>
          </div>
          <nav className={styles.topbarLinks} aria-label="Dev 링크">
            <Link to="/dev">Dev 홈</Link>
            <Link to="/stock/005930">실제 종목 상세</Link>
          </nav>
        </header>

        <div className={styles.stickyBar}>
          <nav className={styles.jumpNav} aria-label="레이아웃 바로가기">
            {LAYOUT_SECTIONS.map((section) => (
              <a
                key={section.id}
                className={clsx(styles.jumpLink, section.recommended && styles.jumpLinkRecommended)}
                href={`#${section.id}`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.compareStack}>
          {LAYOUT_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={clsx(styles.compareSection, section.recommended && styles.compareSectionRecommended)}
            >
              <header className={styles.compareSectionHead}>
                <h2 className={styles.compareSectionTitle}>{section.title}</h2>
                <p className={styles.compareSectionDesc}>{section.description}</p>
              </header>
              {renderLayoutPreview(section.id, data)}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
