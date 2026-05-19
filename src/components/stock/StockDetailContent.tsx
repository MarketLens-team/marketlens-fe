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

function polarityDotClass(polarity: SentimentPolarity) {
  if (polarity === 'positive') return styles.dotPos
  if (polarity === 'negative') return styles.dotNeg
  return styles.dotNeu
}

function barSegmentClass(polarity: SentimentPolarity) {
  if (polarity === 'positive') return styles.barPos
  if (polarity === 'negative') return styles.barNeg
  return styles.barNeu
}

/** -100 ~ +100 스케일을 0~100% 위치로 */
function gaugePosition(score: number): number {
  return Math.min(100, Math.max(0, ((score + 100) / 200) * 100))
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
  const avgPos = gaugePosition(sentimentContext.avg30d)
  const currentPos = gaugePosition(sentimentContext.current)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.stockTitle}>{stock.name}</h1>
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
        <button type="button" className={styles.watchlistBtn}>
          ★ 관심종목 추가
        </button>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>감성 점수</p>
          <p className={clsx(styles.summaryValue, scoreToneClass(stock.sentimentScore))}>
            {formatStockScore(stock.sentimentScore)}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>언급량 변화율</p>
          <p
            className={clsx(
              styles.summaryValue,
              stock.mentionChangePercent >= 0 ? styles.scoreUp : styles.scoreDown,
            )}
          >
            {formatPercent(stock.mentionChangePercent)}
          </p>
        </div>
        <div className={clsx(styles.summaryCard, styles.summaryWide)}>
          <p className={styles.summaryLabel}>AI 감성점수 요약 (오늘 뉴스 종합)</p>
          <p className={styles.aiSummaryText}>
            <span className={styles.aiSummaryScore}>{formatStockScore(stock.sentimentScore)}</span>
            {' | '}
            {stock.aiSummary}
          </p>
        </div>
      </div>

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
            <div className={styles.gaugeWrap}>
              <div
                className={styles.gaugeTrack}
                role="img"
                aria-label={`감성 게이지: 현재 ${sentimentContext.current}, 30일 평균 ${sentimentContext.avg30d}`}
              >
                <span
                  className={clsx(styles.gaugeMarker, styles.gaugeMarkerAvg)}
                  style={{ left: `${avgPos}%` }}
                  title={`30일 평균 ${formatStockScore(sentimentContext.avg30d)}`}
                />
                <span
                  className={clsx(styles.gaugeMarker, styles.gaugeMarkerCurrent)}
                  style={{ left: `${currentPos}%` }}
                  title={`현재 ${formatStockScore(sentimentContext.current)}`}
                />
              </div>
              <div className={styles.gaugeLabels}>
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>
            <p className={styles.contextNote}>{sentimentContext.summaryNote}</p>
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="stock-breakdown-title">
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
            <BreakdownTable rows={sentimentBreakdown.rows} finalScore={sentimentBreakdown.finalScore} totalCount={sentimentBreakdown.totalCount} />
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

function BreakdownTable({
  rows,
  totalCount,
  finalScore,
}: {
  rows: StockSentimentBreakdownRow[]
  totalCount: number
  finalScore: number
}) {
  return (
    <table className={styles.breakdownTable}>
      <thead>
        <tr>
          <th scope="col">분류</th>
          <th scope="col">건수</th>
          <th scope="col">평균 점수</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.polarity}>
            <td>
              <span className={styles.breakdownPolarity}>
                <span className={clsx(styles.polarityDot, polarityDotClass(row.polarity))} aria-hidden />
                {row.label}
                <span className={styles.mono}> {row.percent}%</span>
              </span>
            </td>
            <td className={styles.mono}>{row.count}건</td>
            <td className={clsx(styles.mono, scoreToneClass(row.avgScore))}>
              {formatStockScore(row.avgScore)}
            </td>
          </tr>
        ))}
        <tr>
          <td>총합</td>
          <td className={styles.mono}>{totalCount}건</td>
          <td className={clsx(styles.mono, scoreToneClass(finalScore))}>{formatStockScore(finalScore)}</td>
        </tr>
      </tbody>
    </table>
  )
}
