import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  SentimentPolarity,
  StockDetail,
  StockNewsItem,
  StockSentimentBreakdownRow,
} from '../../data/types/stock'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import { StockHeaderAiSummary } from './StockHeaderAiSummary'
import { StockSentimentTrendChart } from './StockSentimentTrendChart'
import { formatPercent, formatPrice, formatStockScore } from './stockScore'
import styles from './StockDetailContent.module.css'

type NewsFilter = 'all' | 'positive' | 'negative'

function scoreToneClass(score: number) {
  if (score > 0) return styles.scoreUp
  if (score < 0) return styles.scoreDown
  return styles.scoreMuted
}

function pillClass(score: number) {
  if (score > 0) return styles.pillPos
  if (score < 0) return styles.pillNeg
  return styles.pillNeu
}

function barSegmentClass(polarity: SentimentPolarity) {
  if (polarity === 'positive') return styles.barPos
  if (polarity === 'negative') return styles.barNeg
  return styles.barNeu
}

function filterNews(items: StockNewsItem[], filter: NewsFilter): StockNewsItem[] {
  if (filter === 'all') return items
  if (filter === 'positive') return items.filter((n) => n.sentiment === 'positive')
  return items.filter((n) => n.sentiment === 'negative')
}

export interface StockDetailContentProps {
  data: StockDetail
}

export function StockDetailContent({ data }: StockDetailContentProps) {
  const { stock, sentimentContext, sentimentBreakdown, recentNews, relatedStocks, peopleTimeline } =
    data
  const [newsFilter, setNewsFilter] = useState<NewsFilter>('all')

  const filteredNews = useMemo(() => filterNews(recentNews, newsFilter), [recentNews, newsFilter])

  const priceUp = stock.price.change >= 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.stockTitle}>{stock.name}</h1>
          <button type="button" className={styles.watchlistBtn}>
            ★ 관심종목 추가
          </button>
        </div>
        <div className={styles.headerBody}>
          <div className={styles.headerLeft}>
            <div className={styles.stockMeta}>
              <span>{stock.code}</span>
              <span className={styles.stockMetaSep} aria-hidden>
                ·
              </span>
              <span>{stock.market}</span>
              <span className={styles.stockMetaSep} aria-hidden>
                ·
              </span>
              <span>{stock.sector}</span>
            </div>
            <div className={styles.priceBlock}>
              {stock.price.current > 0 ? (
                <>
                  <span className={styles.priceCurrent}>{formatPrice(stock.price.current)}</span>
                  <span className={clsx(styles.priceChange, priceUp ? styles.priceUp : styles.priceDown)}>
                    {priceUp ? '+' : ''}
                    {formatPrice(stock.price.change)} ({priceUp ? '+' : ''}
                    {stock.price.changePercent}%)
                  </span>
                </>
              ) : (
                <span className={styles.priceCurrent}>—</span>
              )}
            </div>
          </div>
          <div className={styles.headerMetrics}>
            <div className={styles.headerStat}>
              <p className={styles.headerStatLabel}>감성 점수</p>
              <p className={clsx(styles.headerStatValue, scoreToneClass(stock.sentimentScore))}>
                {formatStockScore(stock.sentimentScore)}
              </p>
            </div>
            <div className={styles.headerStat}>
              <p className={styles.headerStatLabel}>언급량 변화율</p>
              <p
                className={clsx(
                  styles.headerStatValue,
                  stock.mentionChangePercent >= 0 ? styles.scoreUp : styles.scoreDown,
                )}
              >
                {formatPercent(stock.mentionChangePercent)}
              </p>
            </div>
            <StockHeaderAiSummary summary={stock.aiSummary} />
          </div>
        </div>
      </header>

      <div className={styles.middleGrid}>
        <section className={styles.panel} aria-labelledby="stock-context-title">
          <div className={styles.panelBody}>
            <h2 id="stock-context-title" className={styles.panelTitle}>
              30일 평균 대비 현재 위치
            </h2>
            <p className={styles.panelSub}>최근 한 달 감성점수 맥락</p>
            <div className={styles.contextStats}>
              <div className={styles.contextStat}>
                <span className={styles.contextStatLabel}>현재</span>
                <span className={clsx(styles.contextStatValue, scoreToneClass(sentimentContext.current))}>
                  {formatStockScore(sentimentContext.current)}
                </span>
              </div>
              <div className={styles.contextStat}>
                <span className={styles.contextStatLabel}>30일 평균</span>
                <span className={clsx(styles.contextStatValue, scoreToneClass(sentimentContext.avg30d))}>
                  {formatStockScore(sentimentContext.avg30d)}
                </span>
              </div>
              <div className={styles.contextStat}>
                <span className={styles.contextStatLabel}>30일 최고</span>
                <span className={clsx(styles.contextStatValue, scoreToneClass(sentimentContext.high30d))}>
                  {formatStockScore(sentimentContext.high30d)}
                </span>
              </div>
            </div>
            <StockSentimentTrendChart trend={sentimentContext.trend} currentScore={sentimentContext.current} />
            <p className={styles.contextNote}>{sentimentContext.summaryNote}</p>
          </div>
        </section>

        <section
          className={clsx(styles.panel, styles.panelBreakdown)}
          aria-labelledby="stock-breakdown-title"
        >
          <div className={styles.panelBody}>
            <h2 id="stock-breakdown-title" className={styles.panelTitle}>
              감성 분류 분포 · 오늘
            </h2>
            <div className={styles.stackedBar} role="img" aria-label="감성 분류 분포 막대">
              {sentimentBreakdown.rows.map((row) => (
                <span
                  key={row.polarity}
                  className={barSegmentClass(row.polarity)}
                  style={{ width: `${row.percent}%` }}
                />
              ))}
            </div>
            <BreakdownList rows={sentimentBreakdown.rows} />
          </div>
        </section>
      </div>

      <div className={styles.bottomGrid}>
        <section className={styles.panel} aria-labelledby="stock-news-title">
          <div className={styles.panelHeadRow}>
            <h2 id="stock-news-title" className={styles.panelTitle}>
              관련 뉴스
            </h2>
            <div className={styles.filterGroup} role="group" aria-label="뉴스 감성 필터">
              {(
                [
                  ['all', '전체'],
                  ['positive', '긍정'],
                  ['negative', '부정'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={clsx(styles.filterBtn, newsFilter === key && styles.filterBtnActive)}
                  aria-pressed={newsFilter === key}
                  onClick={() => setNewsFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {filteredNews.length === 0 ? (
            <p className={styles.emptyNews}>해당 필터에 맞는 뉴스가 없습니다.</p>
          ) : (
            <ul className={styles.newsList}>
              {filteredNews.map((item) => (
                <li key={item.id} className={styles.newsItem}>
                  <div className={styles.newsTop}>
                    <span className={clsx(styles.scorePill, pillClass(item.sentimentScore))}>
                      {formatStockScore(item.sentimentScore)}
                    </span>
                    <span className={styles.newsMeta}>
                      {item.source} · {formatRelativeTimeKo(item.publishedAt)}
                    </span>
                  </div>
                  {item.url ? (
                    <h3 className={styles.newsTitle}>
                      <a
                        className={styles.newsTitleLink}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    </h3>
                  ) : (
                    <h3 className={styles.newsTitle}>{item.title}</h3>
                  )}
                  <p className={styles.aiReason}>
                    <span className={styles.aiReasonLabel}>AI 분석 근거: </span>
                    {item.aiReason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className={styles.rightStack}>
          <section className={styles.panel} aria-labelledby="stock-related-title">
            <div className={styles.panelBody}>
              <h2 id="stock-related-title" className={styles.panelTitle}>
                연관 종목
              </h2>
              <ul className={styles.simpleList}>
                {relatedStocks.map((related) => (
                  <li key={related.code} className={styles.simpleListItem}>
                    <Link className={styles.stockLink} to={`/stock/${related.code}`}>
                      <span className={styles.stockLinkName}>{related.name}</span>
                      <span className={clsx(styles.mono, scoreToneClass(related.sentimentScore))}>
                        {formatStockScore(related.sentimentScore)}
                      </span>
                      <span className={styles.stockLinkArrow} aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="stock-people-title">
            <div className={styles.panelBody}>
              <h2 id="stock-people-title" className={styles.panelTitle}>
                인물 발언 타임라인
              </h2>
              <ul className={styles.simpleList}>
                {peopleTimeline.map((person) => (
                  <li key={person.id} className={styles.simpleListItem}>
                    <div className={styles.personRow}>
                      <span className={styles.personTime}>{person.relativeLabel}</span>
                      <div className={styles.personInfo}>
                        <p className={styles.personName}>{person.personName}</p>
                        <p className={styles.personRole}>{person.role}</p>
                      </div>
                      <span className={clsx(styles.scorePill, pillClass(person.sentimentScore))}>
                        {formatStockScore(person.sentimentScore)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <p className={styles.disclaimer} role="note">
        <span className={styles.disclaimerIcon} aria-hidden>
          △
        </span>
        감성 점수는 예측이 아닌 참고 지표입니다. 투자 판단은 본인 책임입니다.
      </p>
    </div>
  )
}

function breakdownBadgeClass(polarity: SentimentPolarity) {
  if (polarity === 'positive') return styles.breakdownBadgePos
  if (polarity === 'negative') return styles.breakdownBadgeNeg
  return styles.breakdownBadgeNeu
}

function BreakdownList({ rows }: { rows: StockSentimentBreakdownRow[] }) {
  return (
    <ul className={styles.breakdownList}>
      {rows.map((row) => (
        <li key={row.polarity} className={styles.breakdownRow}>
          <span className={styles.breakdownLabel}>{row.label}</span>
          <span className={clsx(styles.breakdownBadge, breakdownBadgeClass(row.polarity))}>
            {row.count}건
          </span>
        </li>
      ))}
    </ul>
  )
}
