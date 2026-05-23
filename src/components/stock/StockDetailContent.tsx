import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isMockDataSource } from '../../config/dataSource'
import { addWatchlistItem, removeWatchlistItem } from '../../data/clients/watchlistClient'
import { BackToTopButton } from '../common/BackToTopButton'
import { EmptyState } from '../common/EmptyState'
import { PillButton } from '../ui/PillButton'
import type {
  SentimentPolarity,
  StockDetail,
  StockSentimentBreakdownRow,
} from '../../data/types/stock'
import { EntityAvatar } from '../ui/EntityAvatar'
import { StockHeaderAiSummary } from './StockHeaderAiSummary'
import { StockSentimentTrendChart } from './StockSentimentTrendChart'
import { formatPercent, formatPrice, formatStockScore } from './stockScore'
import styles from './StockDetailContent.module.css'

/** 연관 종목 UI 노출 상한 (API 응답은 그대로, 프론트에서 일시 제한) */
const RELATED_STOCKS_DISPLAY_MAX = 3

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

export interface StockDetailContentProps {
  data: StockDetail
}

export function StockDetailContent({ data }: StockDetailContentProps) {
  const {
    stock,
    watchlistInterested,
    sentimentContext,
    sentimentBreakdown,
    relatedStocks,
    peopleTimeline,
  } = data
  const [interested, setInterested] = useState(watchlistInterested)
  const [watchlistPending, setWatchlistPending] = useState(false)

  useEffect(() => {
    setInterested(watchlistInterested)
  }, [watchlistInterested, stock.code])

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

  const priceUp = stock.price.change >= 0

  return (
    <div className={styles.page}>
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
        <section className={clsx(styles.panel, styles.relatedPanel)} aria-labelledby="stock-related-title">
          <div className={styles.panelBody}>
            <h2 id="stock-related-title" className={styles.panelTitle}>
              연관 종목
            </h2>
            <ul className={styles.simpleList}>
              {relatedStocks.slice(0, RELATED_STOCKS_DISPLAY_MAX).map((related) => (
                <li key={related.code} className={styles.simpleListItem}>
                  <Link className={styles.stockLink} to={`/stock/${related.code}`}>
                    <EntityAvatar
                      variant="stock"
                      size="sm"
                      name={related.name}
                      imageUrl={related.imageUrl}
                    />
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
                    <div className={styles.personTimelineRow}>
                      <span
                        className={clsx(
                          styles.personTimelineTime,
                          person.isFresh ? styles.personTimelineTimeFresh : styles.personTimelineTimeMuted,
                        )}
                      >
                        {person.relativeLabel}
                      </span>
                      <EntityAvatar
                        variant="person"
                        size="sm"
                        name={person.personName}
                        imageUrl={person.imageUrl}
                      />
                      <div className={styles.personTimelineContent}>
                        <p className={styles.personTimelineHeadline}>{person.summary}</p>
                        <p className={styles.personTimelineMeta}>
                          <span className={styles.personTimelineName}>{person.personName}</span>
                          <span aria-hidden> · </span>
                          <span>{person.role}</span>
                          <span aria-hidden> · </span>
                          <span>{person.sourceName}</span>
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
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
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
