import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isMockDataSource } from '../../config/dataSource'
import { addWatchlistItem, removeWatchlistItem } from '../../data/clients/watchlistClient'
import { BackToTopButton } from '../common/BackToTopButton'
import { Breadcrumb } from '../common/Breadcrumb'
import { EmptyState } from '../common/EmptyState'
import { FeedLoadingSpinner } from '../common/FeedLoadingSpinner'
import { PillButton } from '../ui/PillButton'
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
import { EntityAvatar } from '../ui/EntityAvatar'
import { StockHeaderAiSummary } from './StockHeaderAiSummary'
import { StockNewsListItem } from './StockNewsListItem'
import { StockSentimentTrendChart } from './StockSentimentTrendChart'
import { buildPersonDetailPath } from '../../lib/buildPersonRoute'
import { buildStockListPath } from '../../lib/buildStockRoute'
import { formatPercent, formatPrice, formatStockScore } from './stockScore'
import styles from './StockDetailContent.module.css'

type NewsFilter = 'all' | 'positive' | 'negative'

/** 연관 종목 UI 노출 상한 (API 응답은 그대로, 프론트에서 일시 제한) */
const RELATED_STOCKS_DISPLAY_MAX = 3

/** stockSentimentZones 중립 구간(±20)과 동일 */
const SENTIMENT_NEUTRAL_BAND = 20

function scoreToneClass(score: number) {
  if (score > SENTIMENT_NEUTRAL_BAND) return styles.scoreUp
  if (score < -SENTIMENT_NEUTRAL_BAND) return styles.scoreDown
  return styles.scoreNeutral
}

function pillClass(score: number) {
  if (score > SENTIMENT_NEUTRAL_BAND) return styles.pillPos
  if (score < -SENTIMENT_NEUTRAL_BAND) return styles.pillNeg
  return styles.pillWarn
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
  /** 검색 등에서 진입 시 강조·(선택) 스크롤할 뉴스 id */
  focusNewsId?: string | null
  /** `false`면 제목 초록 강조만, 스크롤 없음 (전체 뉴스 → 종목) */
  scrollToFocusNews?: boolean
  onClearFocusNews?: () => void
}

export function StockDetailContent({
  data,
  focusNewsId = null,
  scrollToFocusNews = true,
  onClearFocusNews,
}: StockDetailContentProps) {
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
  const [loadingNewsFilter, setLoadingNewsFilter] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [interested, setInterested] = useState(watchlistInterested)
  const [watchlistPending, setWatchlistPending] = useState(false)
  const skipNewsFilterFetchRef = useRef(true)
  const didScrollToNewsFocusRef = useRef<string | null>(null)
  const useApiNewsFilter = !isMockDataSource()

  useEffect(() => {
    setNewsFilter('all')
    setNewsItems(recentNews)
    setPagination(newsPagination)
    setLoadMoreError(null)
    skipNewsFilterFetchRef.current = true
  }, [stock.code, recentNews, newsPagination])

  useEffect(() => {
    setInterested(watchlistInterested)
  }, [watchlistInterested, stock.code])

  useEffect(() => {
    if (!useApiNewsFilter) return
    if (skipNewsFilterFetchRef.current) {
      skipNewsFilterFetchRef.current = false
      return
    }

    let cancelled = false
    const run = async () => {
      setLoadingNewsFilter(true)
      setLoadMoreError(null)
      try {
        const page = await fetchStockNewsFeedCursor(stock.code, {
          limit: 20,
          sentiment: newsFilter === 'all' ? undefined : newsFilter,
        })
        if (cancelled) return
        setNewsItems(mapNewsFeedItems(page.items, [stock.name, stock.code]))
        setPagination({
          nextCursor: page.nextCursor,
          hasNext: page.hasNext,
        })
      } catch (e) {
        if (!cancelled) {
          setLoadMoreError(e instanceof Error ? e.message : '뉴스를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoadingNewsFilter(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [newsFilter, stock.code, stock.name, useApiNewsFilter])

  const displayNews = useMemo(
    () => (useApiNewsFilter ? newsItems : filterNews(newsItems, newsFilter)),
    [newsItems, newsFilter, useApiNewsFilter],
  )

  useEffect(() => {
    if (!focusNewsId) return
    setNewsFilter('all')
    skipNewsFilterFetchRef.current = true
    didScrollToNewsFocusRef.current = null
  }, [focusNewsId, stock.code])

  useEffect(() => {
    if (!focusNewsId || loadingNewsFilter) return
    if (didScrollToNewsFocusRef.current === focusNewsId) return
    const hasTarget = displayNews.some((item) => item.id === focusNewsId)
    if (!hasTarget) return

    if (!scrollToFocusNews) {
      didScrollToNewsFocusRef.current = focusNewsId
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(`stock-news-${focusNewsId}`)
      if (!el) return
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      didScrollToNewsFocusRef.current = focusNewsId
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusNewsId, displayNews, loadingNewsFilter, scrollToFocusNews])

  useEffect(() => {
    if (!focusNewsId || !onClearFocusNews) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const focusedEl = document.getElementById(`stock-news-${focusNewsId}`)
      if (focusedEl?.contains(target)) return
      onClearFocusNews()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [focusNewsId, onClearFocusNews])

  const newsSentimentParam = newsFilter === 'all' ? undefined : newsFilter

  const loadMoreNews = useCallback(async () => {
    if (!pagination.hasNext || !pagination.nextCursor || loadingMoreNews) return
    setLoadingMoreNews(true)
    setLoadMoreError(null)
    try {
      const page = await fetchStockNewsFeedCursor(stock.code, {
        limit: 20,
        cursor: pagination.nextCursor,
        sentiment: newsSentimentParam,
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
    newsSentimentParam,
    stock.code,
    stock.name,
  ])

  const toggleWatchlist = useCallback(async () => {
    if (watchlistPending) return
    setWatchlistPending(true)
    try {
      if (isMockDataSource()) {
        setInterested((prev) => !prev)
        return
      }
      if (interested) {
        await removeWatchlistItem(stock.code)
        setInterested(false)
      } else {
        await addWatchlistItem(stock.code)
        setInterested(true)
      }
    } catch {
      /* 상태 유지 */
    } finally {
      setWatchlistPending(false)
    }
  }, [interested, stock.code, watchlistPending])

  const newsSentinelRef = useInfiniteScroll({
    enabled: displayNews.length > 0,
    hasMore: pagination.hasNext,
    loading: loadingMoreNews,
    onLoadMore: () => void loadMoreNews(),
  })

  const priceUp = stock.price.change >= 0

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: '전체 종목', to: buildStockListPath() },
          { label: stock.name, current: true },
        ]}
      />
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitleRow}>
            <EntityAvatar
              variant="stock"
              size="xl"
              name={stock.name}
              imageUrl={stock.imageUrl}
            />
            <h1 className={styles.stockTitle}>{stock.name}</h1>
          </div>
          <PillButton
            variant={interested ? 'secondary' : 'primary'}
            active={interested}
            disableHover
            onClick={() => void toggleWatchlist()}
            disabled={watchlistPending}
            aria-pressed={interested}
          >
            {interested ? '★ 관심종목' : '관심종목 추가'}
          </PillButton>
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
            <div className={styles.trendPanelHead}>
              <div className={styles.trendPanelHeadMain}>
                <h2 id="stock-trend-title" className={styles.panelTitle}>
                  30일 감성 추이
                </h2>
                <p className={styles.panelSub}>최근 한 달 감성점수 변화</p>
              </div>
              <div className={styles.trendContextStats} aria-label="30일 감성 맥락">
                <div className={styles.trendContextStat}>
                  <span className={styles.trendContextStatLabel}>30일 평균</span>
                  <span
                    className={clsx(
                      styles.trendContextStatValue,
                      scoreToneClass(sentimentContext.avg30d),
                    )}
                  >
                    {formatStockScore(sentimentContext.avg30d)}
                  </span>
                </div>
                <div className={styles.trendContextStat}>
                  <span className={styles.trendContextStatLabel}>30일 최고</span>
                  <span
                    className={clsx(
                      styles.trendContextStatValue,
                      scoreToneClass(sentimentContext.high30d),
                    )}
                  >
                    {formatStockScore(sentimentContext.high30d)}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.trendChartWrap}>
              <StockSentimentTrendChart
                trend={sentimentContext.trend}
                currentScore={sentimentContext.current}
              />
            </div>
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

          <section
            className={clsx(styles.panel, styles.relatedPanel)}
            aria-labelledby="stock-related-title"
          >
            <div className={styles.panelBody}>
              <h2 id="stock-related-title" className={styles.panelTitle}>
                연관 종목
              </h2>
              <ul className={styles.simpleList}>
                {relatedStocks.slice(0, RELATED_STOCKS_DISPLAY_MAX).map((related) => {
                  const priceUp = (related.price?.changePercent ?? 0) >= 0
                  return (
                    <li key={related.code} className={styles.simpleListItem}>
                      <Link className={styles.stockLink} to={`/stock/${related.code}`}>
                        <EntityAvatar
                          variant="stock"
                          size="sm"
                          name={related.name}
                          imageUrl={related.imageUrl}
                        />
                        <span className={styles.stockLinkName}>{related.name}</span>
                        <span className={styles.stockLinkTrailing}>
                          {related.price && related.price.current > 0 ? (
                            <span className={styles.stockLinkPrice}>
                              {formatPrice(related.price.current)}
                            </span>
                          ) : null}
                          {related.price && related.price.current > 0 ? (
                            <span
                              className={clsx(
                                styles.stockLinkChange,
                                priceUp ? styles.priceUp : styles.priceDown,
                              )}
                            >
                              {formatPercent(related.price.changePercent)}
                            </span>
                          ) : null}
                          <span
                            className={clsx(
                              styles.stockLinkScore,
                              scoreToneClass(related.sentimentScore),
                            )}
                          >
                            {formatStockScore(related.sentimentScore)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
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
                <PillButton
                  key={key}
                  variant="secondary"
                  compact
                  active={newsFilter === key}
                  aria-pressed={newsFilter === key}
                  onClick={() => setNewsFilter(key)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>
          {loadingNewsFilter ? (
            <div className={styles.newsFilterLoading} aria-busy="true">
              <FeedLoadingSpinner />
            </div>
          ) : null}
          {!loadingNewsFilter && displayNews.length === 0 ? (
            <EmptyState
              className={styles.emptyNews}
              title="뉴스가 없어요"
              message="선택한 감성 필터에 맞는 기사가 없습니다."
              hint="전체 탭에서 다시 확인해 보세요."
            />
          ) : null}
          {!loadingNewsFilter && displayNews.length > 0 ? (
            <ul className={styles.newsList}>
              {displayNews.map((item) => (
                <StockNewsListItem
                  key={item.id}
                  item={item}
                  highlighted={focusNewsId === item.id}
                />
              ))}
            </ul>
          ) : null}
          {pagination.hasNext && !loadingNewsFilter ? (
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
          <section
            className={clsx(styles.panel, styles.peoplePanel)}
            aria-labelledby="stock-people-title"
          >
            <div className={styles.peoplePanelBody}>
              <h2 id="stock-people-title" className={styles.peoplePanelTitle}>
                최신 인물 발언 타임라인
              </h2>
              <ul className={styles.peopleTimelineList}>
                {peopleTimeline.length === 0 ? (
                  <li className={styles.peopleTimelineItem}>
                    <EmptyState
                      className={styles.emptyPeople}
                      title="발언이 없어요"
                      message="이 종목과 연결된 인물 발언이 아직 없습니다."
                    />
                  </li>
                ) : (
                  peopleTimeline.map((person) => (
                    <li key={person.id} className={styles.peopleTimelineItem}>
                      <Link
                        to={buildPersonDetailPath(person.personId, { statementId: person.id })}
                        className={styles.personTimelineItemLink}
                        aria-label={`${person.personName} 발언 상세`}
                      >
                        <div className={styles.personTimelineRail}>
                          <EntityAvatar
                            className={styles.personTimelineAvatar}
                            variant="person"
                            size="md"
                            name={person.personName}
                            imageUrl={person.imageUrl}
                          />
                          <span
                            className={clsx(
                              styles.personTimelineTime,
                              person.isFresh
                                ? styles.personTimelineTimeFresh
                                : styles.personTimelineTimeMuted,
                            )}
                          >
                            {person.relativeLabel}
                          </span>
                        </div>
                        <div className={styles.personTimelineBody}>
                          <p className={styles.personTimelineHeadline}>{person.summary}</p>
                          <p className={styles.personTimelineMeta}>
                            <span className={styles.personTimelineName}>{person.personName}</span>
                            <span aria-hidden> · </span>
                            <span>{person.role}</span>
                            <span
                              className={clsx(
                                styles.personTimelineScore,
                                styles.mono,
                                pillClass(person.sentimentScore),
                              )}
                            >
                              {formatStockScore(person.sentimentScore)}
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <BackToTopButton placement="fixed" tooltipSide="left" stockDetailMarker />
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
