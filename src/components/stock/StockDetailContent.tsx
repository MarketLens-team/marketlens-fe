import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackToTopButton } from '../common/BackToTopButton'
import { FeedLoadingSpinner } from '../common/FeedLoadingSpinner'
import { fetchStockNewsFeedCursor } from '../../data/clients/stockClient'
import { mapNewsFeedItems } from '../../data/mappers/stockMapper'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import type {
  SentimentPolarity,
  StockDetail,
  StockNewsItem,
  StockNewsPagination,
  StockSentimentBreakdownRow,
} from '../../data/types/stock'
import { StockHeaderAiSummary } from './StockHeaderAiSummary'
import { StockNewsListItem } from './StockNewsListItem'
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
  const {
    stock,
    watchlistInterested,
    sentimentContext,
    sentimentBreakdown,
    recentNews,
    newsPagination,
    relatedStocks,
    peopleTimeline,
  } = data
  const [newsFilter, setNewsFilter] = useState<NewsFilter>('all')
  const [newsItems, setNewsItems] = useState(recentNews)
  const [pagination, setPagination] = useState<StockNewsPagination>(newsPagination)
  const [loadingMoreNews, setLoadingMoreNews] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  useEffect(() => {
    setNewsFilter('all')
    setNewsItems(recentNews)
    setPagination(newsPagination)
    setLoadMoreError(null)
  }, [stock.code, recentNews, newsPagination])

  const filteredNews = useMemo(() => filterNews(newsItems, newsFilter), [newsItems, newsFilter])

  const loadMoreNews = useCallback(async () => {
    if (!pagination.hasNext || !pagination.nextCursor || loadingMoreNews) return
    setLoadingMoreNews(true)
    setLoadMoreError(null)
    try {
      const page = await fetchStockNewsFeedCursor(stock.code, {
        limit: 20,
        cursor: pagination.nextCursor,
      })
      const mapped = mapNewsFeedItems(page.items, [stock.name, stock.code])
      setNewsItems((prev) => {
        const seen = new Set(prev.map((item) => item.id))
        const next = mapped.filter((item) => !seen.has(item.id))
        return [...prev, ...next]
      })
      setPagination({
        nextCursor: page.nextCursor,
        hasNext: page.hasNext,
      })
    } catch (e) {
      setLoadMoreError(e instanceof Error ? e.message : '뉴스를 더 불러오지 못했습니다.')
    } finally {
      setLoadingMoreNews(false)
    }
  }, [
    loadingMoreNews,
    pagination.hasNext,
    pagination.nextCursor,
    stock.code,
    stock.name,
  ])

  const newsSentinelRef = useInfiniteScroll({
    enabled: newsItems.length > 0,
    hasMore: pagination.hasNext,
    loading: loadingMoreNews,
    onLoadMore: () => void loadMoreNews(),
  })

  const priceUp = stock.price.change >= 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.stockTitle}>{stock.name}</h1>
          <button type="button" className={styles.watchlistBtn}>
            {watchlistInterested ? '★ 관심종목' : '☆ 관심종목 추가'}
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
        <section className={styles.panel} aria-labelledby="stock-trend-title">
          <div className={styles.panelBody}>
            <h2 id="stock-trend-title" className={styles.panelTitle}>
              30일 감성 추이
            </h2>
            <p className={styles.panelSub}>최근 한 달 감성점수 변화</p>
            <StockSentimentTrendChart trend={sentimentContext.trend} currentScore={sentimentContext.current} />
          </div>
        </section>

        <aside className={styles.middleAside}>
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

          <section className={styles.panel} aria-labelledby="stock-context-title">
            <div className={styles.panelBody}>
              <h2 id="stock-context-title" className={styles.panelTitle}>
                30일 평균 대비 현재 위치
              </h2>
              <p className={styles.panelSub}>최근 한 달 감성점수 맥락</p>
              <div className={styles.contextStats}>
                <div className={styles.contextStat}>
                  <span className={styles.contextStatLabel}>현재</span>
                  <span
                    className={clsx(styles.contextStatValue, scoreToneClass(sentimentContext.current))}
                  >
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
                  <span
                    className={clsx(styles.contextStatValue, scoreToneClass(sentimentContext.high30d))}
                  >
                    {formatStockScore(sentimentContext.high30d)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>
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
                <StockNewsListItem key={item.id} item={item} />
              ))}
            </ul>
          )}
          {pagination.hasNext ? (
            <div className={styles.newsScrollFoot}>
              <div ref={newsSentinelRef} className={styles.newsSentinel} aria-hidden />
              {loadingMoreNews ? <FeedLoadingSpinner /> : null}
            </div>
          ) : null}
          {loadMoreError ? (
            <p className={styles.loadMoreError} role="alert">
              {loadMoreError}
            </p>
          ) : null}
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
                      <span
                        className={clsx(
                          styles.stockLinkScore,
                          styles.mono,
                          scoreToneClass(related.sentimentScore),
                        )}
                      >
                        {formatStockScore(related.sentimentScore)}
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

      <BackToTopButton placement="fixed" tooltipSide="left" />
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
