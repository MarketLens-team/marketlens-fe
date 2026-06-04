import clsx from 'clsx'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isMockDataSource } from '../../config/dataSource'
import { addWatchlistItem, removeWatchlistItem } from '../../data/clients/watchlistClient'
import { BackToTopButton } from '../common/BackToTopButton'
import { Breadcrumb } from '../common/Breadcrumb'
import { EmptyState } from '../common/EmptyState'
import { FeedLoadingSpinner } from '../common/FeedLoadingSpinner'
import { PillButton } from '../ui/PillButton'
import {
  fetchStockNewsFeedAround,
  fetchStockNewsFeedCursor,
  fetchStockNewsFeedNewer,
  fetchStockNewsFeedOlder,
} from '../../data/clients/stockClient'
import { ANCHORED_FEED_PAGE_LIMIT } from '../../data/types/anchoredFeed'
import type { NewsFeedAroundResponse } from '../../data/types/stockApi'
import {
  ANCHORED_INFINITE_SCROLL_COOLDOWN_MS,
  ANCHORED_SCROLL_PREFETCH_EDGE_PX,
  ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX,
} from '../../data/types/anchoredFeed'
import { useAnchoredFeed } from '../../hooks/useAnchoredFeed'
import { useNewsBookmarks } from '../../hooks/useNewsBookmarks'
import { useTransientSnackbar } from '../../hooks/useTransientSnackbar'
import { mapNewsFeedItems } from '../../data/mappers/stockMapper'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import type {
  SentimentPolarity,
  StockDetail,
  StockNewsItem,
  StockSentimentBreakdownRow,
} from '../../data/types/stock'
import { EntityAvatar } from '../ui/EntityAvatar'
import { Snackbar } from '../ui/Snackbar'
import { StockHeaderAiSummary } from './StockHeaderAiSummary'
import { StockDetailPeoplePanel } from './StockDetailPeoplePanel'
import { StockNewsListItem } from './StockNewsListItem'
import { StockSentimentTrendChart } from './StockSentimentTrendChart'
import { buildStockListPath } from '../../lib/buildStockRoute'
import { scrollStockNewsItemIntoView } from '../../lib/newsFeedFocus'
import { formatPercent, formatPrice, formatStockScore, priceChangeDirection, stockSentimentTone } from './stockScore'
import styles from './StockDetailContent.module.css'

type NewsFilter = 'all' | 'positive' | 'negative'

/** 연관 종목 UI 노출 상한 (API 응답은 그대로, 프론트에서 일시 제한) */
const RELATED_STOCKS_DISPLAY_MAX = 3
const NEWS_FOCUS_SCROLL_RETRIES = 10
const NEWS_FOCUS_SCROLL_RETRY_MS = 80

function scoreToneClass(score: number) {
  const tone = stockSentimentTone(score)
  if (tone === 'positive') return styles.scoreUp
  if (tone === 'negative') return styles.scoreDown
  return styles.scoreNeutral
}

function pillClass(score: number) {
  const tone = stockSentimentTone(score)
  if (tone === 'positive') return styles.pillPos
  if (tone === 'negative') return styles.pillNeg
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
}

export function StockDetailContent({
  data,
  focusNewsId = null,
  scrollToFocusNews = true,
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
  const [loadingMoreNews, setLoadingMoreNews] = useState(false)
  const [loadingNewsFilter, setLoadingNewsFilter] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [interested, setInterested] = useState(watchlistInterested)
  const [watchlistPending, setWatchlistPending] = useState(false)
  const skipNewsFilterFetchRef = useRef(true)
  const didScrollToNewsFocusRef = useRef<string | null>(null)
  const [suppressAnchored, setSuppressAnchored] = useState(false)
  const [latestNewsOverride, setLatestNewsOverride] = useState<{
    items: StockNewsItem[]
    pagination: { nextCursor: string | null; hasNext: boolean }
  } | null>(null)
  const [resettingToLatest, setResettingToLatest] = useState(false)
  const [skipFocusScroll, setSkipFocusScroll] = useState(false)
  const {
    isBookmarked,
    isBookmarkPending,
    toggleBookmark,
    loadError: bookmarkLoadError,
  } = useNewsBookmarks()
  const snackbar = useTransientSnackbar()
  const useApiNewsFilter = !isMockDataSource()
  const newsSentimentParam = newsFilter === 'all' ? undefined : newsFilter
  const useAnchoredAround = Boolean(focusNewsId) && !suppressAnchored
  const initialNewsItems = latestNewsOverride?.items ?? recentNews
  const initialNewsPagination = latestNewsOverride?.pagination ?? newsPagination

  const mapStockNewsAroundPage = useCallback(
    (page: NewsFeedAroundResponse) => ({
      items: mapNewsFeedItems(page.items, [stock.name, stock.code]),
      pagination: {
        newerCursor: page.newerCursor,
        hasNewer: page.hasNewer,
        olderCursor: page.olderCursor,
        hasOlder: page.hasOlder,
      },
    }),
    [stock.code, stock.name],
  )

  const fetchNewsAround = useCallback(
    async (newsId: string) => {
      const page = await fetchStockNewsFeedAround(stock.code, newsId, {
        limit: ANCHORED_FEED_PAGE_LIMIT,
        sentiment: newsSentimentParam,
      })
      return mapStockNewsAroundPage(page)
    },
    [stock.code, newsSentimentParam, mapStockNewsAroundPage],
  )

  const fetchNewsNewer = useCallback(
    async (cursor: string) => {
      const page = await fetchStockNewsFeedNewer(stock.code, {
        limit: ANCHORED_FEED_PAGE_LIMIT,
        cursor,
        sentiment: newsSentimentParam,
      })
      return mapStockNewsAroundPage(page)
    },
    [stock.code, newsSentimentParam, mapStockNewsAroundPage],
  )

  const fetchNewsOlder = useCallback(
    async (cursor: string) => {
      const page = await fetchStockNewsFeedOlder(stock.code, {
        limit: ANCHORED_FEED_PAGE_LIMIT,
        cursor,
        sentiment: newsSentimentParam,
      })
      return mapStockNewsAroundPage(page)
    },
    [stock.code, newsSentimentParam, mapStockNewsAroundPage],
  )

  const {
    items: newsItems,
    feedMode,
    latestPagination: pagination,
    loadingAround: loadingAnchoredNews,
    loadingNewer: loadingNewerNews,
    loadingOlder: loadingOlderNews,
    anchoredLoadingUi,
    aroundError: anchoredNewsError,
    anchoredWarmComplete,
    hasMoreDown,
    hasMoreUp,
    loadNewer: loadNewerNews,
    loadOlder: loadOlderNews,
    replaceLatestItems,
    appendLatestItems,
    cancelAroundLoad,
  } = useAnchoredFeed<StockNewsItem>({
    scopeKey: stock.code,
    anchorId: useAnchoredAround ? focusNewsId : null,
    initialItems: initialNewsItems,
    initialLatestPagination: initialNewsPagination,
    anchoredEnabled: useAnchoredAround,
    fetchAround: fetchNewsAround,
    fetchNewer: fetchNewsNewer,
    fetchOlder: fetchNewsOlder,
  })

  const focusNewsFeedReady =
    anchoredWarmComplete && !loadingAnchoredNews && !resettingToLatest

  useEffect(() => {
    setSuppressAnchored(false)
    setLatestNewsOverride(null)
    setSkipFocusScroll(false)
  }, [focusNewsId, stock.code])

  useEffect(() => {
    setNewsFilter('all')
    if (!focusNewsId) {
      replaceLatestItems(recentNews, newsPagination)
    }
    setLoadMoreError(null)
    skipNewsFilterFetchRef.current = true
  }, [stock.code, recentNews, newsPagination, focusNewsId, replaceLatestItems])

  const resetToLatestNewsFeed = useCallback(async () => {
    if (!focusNewsId) return

    cancelAroundLoad()
    setResettingToLatest(true)
    setLoadMoreError(null)
    try {
      const page = await fetchStockNewsFeedCursor(stock.code, {
        limit: 20,
        sentiment: newsSentimentParam,
      })
      const items = mapNewsFeedItems(page.items, [stock.name, stock.code])
      const pagination = {
        nextCursor: page.nextCursor ?? null,
        hasNext: page.hasNext ?? false,
      }
      setLatestNewsOverride({ items, pagination })
      replaceLatestItems(items, pagination)
      setSuppressAnchored(true)
      skipNewsFilterFetchRef.current = true
    } catch (e) {
      setLoadMoreError(e instanceof Error ? e.message : '뉴스 목록을 새로고침하지 못했습니다.')
    } finally {
      setResettingToLatest(false)
    }
  }, [
    focusNewsId,
    cancelAroundLoad,
    stock.code,
    stock.name,
    newsSentimentParam,
    replaceLatestItems,
  ])

  const handleBackToTop = useCallback(() => {
    if (focusNewsId) {
      setSkipFocusScroll(true)
      void resetToLatestNewsFeed()
    }
  }, [focusNewsId, resetToLatestNewsFeed])

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
          sentiment: newsSentimentParam,
        })
        if (cancelled) return
        replaceLatestItems(mapNewsFeedItems(page.items, [stock.name, stock.code]), {
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
  }, [newsFilter, newsSentimentParam, stock.code, stock.name, useApiNewsFilter, replaceLatestItems])

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

  const loadMoreNews = useCallback(async () => {
    if (feedMode === 'anchored') {
      if (loadingOlderNews) return
      setLoadMoreError(null)
      try {
        await loadOlderNews()
      } catch (e) {
        setLoadMoreError(e instanceof Error ? e.message : '뉴스를 더 불러오지 못했습니다.')
      }
      return
    }

    if (!pagination.hasNext || !pagination.nextCursor || loadingMoreNews) return
    setLoadingMoreNews(true)
    setLoadMoreError(null)
    try {
      const page = await fetchStockNewsFeedCursor(stock.code, {
        limit: 20,
        cursor: pagination.nextCursor,
        sentiment: newsSentimentParam,
      })
      appendLatestItems(mapNewsFeedItems(page.items, [stock.name, stock.code]), {
        nextCursor: page.nextCursor,
        hasNext: page.hasNext,
      })
    } catch (e) {
      setLoadMoreError(e instanceof Error ? e.message : '뉴스를 더 불러오지 못했습니다.')
    } finally {
      setLoadingMoreNews(false)
    }
  }, [
    feedMode,
    loadingOlderNews,
    loadOlderNews,
    loadingMoreNews,
    pagination.hasNext,
    pagination.nextCursor,
    newsSentimentParam,
    stock.code,
    stock.name,
    appendLatestItems,
  ])

  useEffect(() => {
    if (skipFocusScroll) return
    if (!focusNewsId || loadingNewsFilter || !focusNewsFeedReady || !scrollToFocusNews) return
    if (didScrollToNewsFocusRef.current === focusNewsId) return

    const hasTarget = displayNews.some(
      (item) => focusNewsId != null && String(item.id) === String(focusNewsId),
    )
    if (!hasTarget) return

    let cancelled = false
    let timeoutId: number | undefined
    let rafId = 0

    const attemptScroll = (triesLeft: number) => {
      if (cancelled) return
      if (scrollStockNewsItemIntoView(focusNewsId)) {
        didScrollToNewsFocusRef.current = focusNewsId
        return
      }
      if (triesLeft > 0) {
        timeoutId = window.setTimeout(() => attemptScroll(triesLeft - 1), NEWS_FOCUS_SCROLL_RETRY_MS)
      }
    }

    rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => attemptScroll(NEWS_FOCUS_SCROLL_RETRIES))
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [
    focusNewsId,
    displayNews,
    loadingNewsFilter,
    focusNewsFeedReady,
    scrollToFocusNews,
    skipFocusScroll,
  ])

  const toggleWatchlist = useCallback(async () => {
    if (watchlistPending) return
    const wasInterested = interested
    setWatchlistPending(true)
    try {
      if (isMockDataSource()) {
        setInterested((prev) => !prev)
        if (wasInterested) {
          snackbar.show('종목 저장이 취소되었습니다.', {
            action: {
              label: '되돌리기',
              onAction: () => {
                void (async () => {
                  setWatchlistPending(true)
                  try {
                    if (isMockDataSource()) {
                      setInterested(true)
                    } else {
                      await addWatchlistItem(stock.code)
                      setInterested(true)
                    }
                    snackbar.show('종목이 다시 저장되었습니다.')
                  } finally {
                    setWatchlistPending(false)
                  }
                })()
              },
            },
          })
        } else {
          snackbar.show('종목이 저장되었습니다.')
        }
        return
      }
      if (interested) {
        await removeWatchlistItem(stock.code)
        setInterested(false)
        snackbar.show('종목 저장이 취소되었습니다.', {
          action: {
            label: '되돌리기',
            onAction: () => {
              void (async () => {
                setWatchlistPending(true)
                try {
                  if (isMockDataSource()) {
                    setInterested(true)
                  } else {
                    await addWatchlistItem(stock.code)
                    setInterested(true)
                  }
                  snackbar.show('종목이 다시 저장되었습니다.')
                } finally {
                  setWatchlistPending(false)
                }
              })()
            },
          },
        })
      } else {
        await addWatchlistItem(stock.code)
        setInterested(true)
        snackbar.show('종목이 저장되었습니다.')
      }
    } catch {
      snackbar.show(wasInterested ? '종목 저장 취소에 실패했습니다.' : '종목 저장에 실패했습니다.')
    } finally {
      setWatchlistPending(false)
    }
  }, [interested, snackbar, stock.code, watchlistPending])

  const handleNewsBookmarkToggle = useCallback(
    async (newsId: string) => {
      const wasBookmarked = isBookmarked(newsId)
      const result = await toggleBookmark(newsId, { type: 'STOCK', stockCode: stock.code })
      if (result === 'added') {
        snackbar.show('뉴스가 저장되었습니다.')
        return
      }
      if (result === 'removed') {
        snackbar.show('뉴스 저장이 취소되었습니다.', {
          action: {
            label: '되돌리기',
            onAction: () => {
              void (async () => {
                const undoResult = await toggleBookmark(newsId, { type: 'STOCK', stockCode: stock.code })
                if (undoResult === 'added') {
                  snackbar.show('뉴스가 다시 저장되었습니다.')
                }
              })()
            },
          },
        })
        return
      }
      if (result === 'error') {
        snackbar.show(
          wasBookmarked ? '뉴스 저장 취소에 실패했습니다.' : '뉴스 저장에 실패했습니다.',
        )
      }
    },
    [isBookmarked, snackbar, stock.code, toggleBookmark],
  )

  const loadingMoreDown = feedMode === 'anchored' ? loadingOlderNews : loadingMoreNews
  const showNewerLoader =
    feedMode === 'anchored' && (loadingNewerNews || anchoredLoadingUi === 'newer')
  const showOlderLoader =
    feedMode === 'anchored' && (loadingMoreDown || anchoredLoadingUi === 'older')

  const newsTopSentinelMargin = `${ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX}px 0px 0px 0px`

  const newsTopSentinelRef = useInfiniteScroll({
    enabled: feedMode === 'anchored' && displayNews.length > 0 && focusNewsFeedReady,
    hasMore: hasMoreUp,
    loading: loadingNewerNews,
    direction: 'up',
    rootMargin: newsTopSentinelMargin,
    requireUserScrollUp: true,
    loadCooldownMs: feedMode === 'anchored' ? ANCHORED_INFINITE_SCROLL_COOLDOWN_MS : undefined,
    onLoadMore: () => {
      setLoadMoreError(null)
      void loadNewerNews().catch((e) => {
        setLoadMoreError(e instanceof Error ? e.message : '뉴스를 더 불러오지 못했습니다.')
      })
    },
  })

  const newsSentinelRef = useInfiniteScroll({
    enabled: displayNews.length > 0 && focusNewsFeedReady,
    hasMore: hasMoreDown,
    loading: loadingMoreDown,
    rootMargin: feedMode === 'anchored' ? `0px 0px ${ANCHORED_SCROLL_PREFETCH_EDGE_PX}px 0px` : undefined,
    loadCooldownMs: feedMode === 'anchored' ? ANCHORED_INFINITE_SCROLL_COOLDOWN_MS : undefined,
    disablePostLoadRetry: feedMode === 'anchored',
    onLoadMore: () => void loadMoreNews(),
  })

  const priceDirection = priceChangeDirection(stock.price.change)

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
          <button
            type="button"
            className={styles.watchlistToggle}
            onClick={() => void toggleWatchlist()}
            disabled={watchlistPending}
            aria-pressed={interested}
            aria-label={interested ? '관심종목 해제' : '관심종목 추가'}
          >
            <span className={styles.watchlistStar} aria-hidden>
              {interested ? '★' : '☆'}
            </span>
            <span className={styles.watchlistLabel}>{interested ? '관심종목' : '관심종목 추가'}</span>
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
                  <span
                    className={clsx(
                      styles.priceChange,
                      priceDirection === 'up' && styles.priceUp,
                      priceDirection === 'down' && styles.priceDown,
                    )}
                  >
                    {priceDirection === 'up' ? '+' : ''}
                    {formatPrice(stock.price.change)} ({formatPercent(stock.price.changePercent)})
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

      <StockDetailMiddleGrid
        sentimentContext={sentimentContext}
        sentimentBreakdown={sentimentBreakdown}
        relatedStocks={relatedStocks}
      />

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
          {loadingNewsFilter || (loadingAnchoredNews && focusNewsId && displayNews.length === 0) ? (
            <div className={styles.newsFilterLoading} aria-busy="true">
              <FeedLoadingSpinner />
            </div>
          ) : null}
          {bookmarkLoadError ? (
            <p className={styles.newsBookmarkError} role="status">
              {bookmarkLoadError}
            </p>
          ) : null}
          {!loadingNewsFilter && displayNews.length === 0 && !loadingAnchoredNews ? (
            <EmptyState
              className={styles.emptyNews}
              title="뉴스가 없어요"
              message="선택한 감성 필터에 맞는 기사가 없습니다."
              hint="전체 탭에서 다시 확인해 보세요."
            />
          ) : null}
          {!loadingNewsFilter && displayNews.length > 0 ? (
            <div
              className={clsx(
                styles.newsFeedWrap,
                loadingAnchoredNews && focusNewsId && styles.newsListAnchoring,
              )}
            >
              {showNewerLoader ? (
                <div className={styles.newsNewerOverlay} aria-busy="true" aria-live="polite">
                  <FeedLoadingSpinner label="이전 뉴스 불러오는 중" />
                </div>
              ) : null}
              <ul
                className={styles.newsList}
                data-anchored-feed-list={feedMode === 'anchored' ? true : undefined}
              >
                {feedMode === 'anchored' && hasMoreUp ? (
                  <li className={styles.newsScrollHead} aria-hidden>
                    <div ref={newsTopSentinelRef} className={styles.newsSentinel} aria-hidden />
                  </li>
                ) : null}
              {displayNews.map((item) => (
                <StockNewsListItem
                  key={item.id}
                  item={item}
                  highlighted={
                    focusNewsId != null && String(focusNewsId) === String(item.id)
                  }
                  showBookmark
                  bookmarked={isBookmarked(item.id)}
                  bookmarkPending={isBookmarkPending(item.id)}
                  onBookmarkToggle={() => void handleNewsBookmarkToggle(item.id)}
                />
              ))}
              </ul>
            </div>
          ) : null}
          {(hasMoreDown || showOlderLoader) && !loadingNewsFilter ? (
            <div
              className={styles.newsScrollFoot}
              role={showOlderLoader ? 'status' : undefined}
              aria-live={showOlderLoader ? 'polite' : undefined}
              aria-busy={showOlderLoader || loadingMoreDown || undefined}
            >
              <div ref={newsSentinelRef} className={styles.newsSentinel} aria-hidden />
              <div
                className={styles.newsLoadMoreSlot}
                aria-hidden={!(showOlderLoader || loadingMoreDown)}
              >
                {showOlderLoader || loadingMoreDown ? (
                  <FeedLoadingSpinner label="뉴스 더 불러오는 중" />
                ) : null}
              </div>
            </div>
          ) : null}
          {loadMoreError || anchoredNewsError ? (
            <p className={styles.loadMoreError} role="alert">
              {loadMoreError ?? anchoredNewsError}
            </p>
          ) : null}
        </section>

        <StockDetailPeoplePanel peopleTimeline={peopleTimeline} pillClass={pillClass} />
      </div>

      <BackToTopButton
        placement="fixed"
        tooltipSide="left"
        stockDetailMarker
        onBackToTop={handleBackToTop}
      />
      {snackbar.message ? (
        <Snackbar
          message={snackbar.message}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.onAction}
        />
      ) : null}
    </div>
  )
}

interface StockDetailMiddleGridProps {
  sentimentContext: StockDetail['sentimentContext']
  sentimentBreakdown: StockDetail['sentimentBreakdown']
  relatedStocks: StockDetail['relatedStocks']
}

const StockDetailMiddleGrid = memo(function StockDetailMiddleGrid({
  sentimentContext,
  sentimentBreakdown,
  relatedStocks,
}: StockDetailMiddleGridProps) {
  return (
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
                const relatedPriceDirection = priceChangeDirection(related.price?.changePercent ?? 0)
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
                              relatedPriceDirection === 'up' && styles.priceUp,
                              relatedPriceDirection === 'down' && styles.priceDown,
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
  )
})

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
