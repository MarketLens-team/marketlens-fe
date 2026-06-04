import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useTransientSnackbar } from '../../hooks/useTransientSnackbar'
import { useServerWatchlist } from '../../hooks/useServerWatchlist'
import { EntityAvatar } from '../ui/EntityAvatar'
import { Snackbar } from '../ui/Snackbar'
import { StockWatchlistStarButton } from './StockWatchlistStarButton'
import type { StockOverviewRow } from '../../data/types/stock'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import {
  buzzSentimentClass,
  formatStockScore,
} from '../buzz/buzzSurgeScore'
import { formatPercent, formatPrice, priceChangeDirection } from './stockScore'
import { formatSentimentDelta24h } from './sentimentDelta'
import styles from './StockOverviewTable.module.css'

export type StockOverviewSortKey =
  | 'name'
  | 'price'
  | 'change'
  | 'mention'
  | 'mentionChange'
  | 'sentiment'
  | 'sentimentDelta'

interface StockOverviewTableProps {
  rows: StockOverviewRow[]
  sortKey: StockOverviewSortKey
  sortDesc: boolean
  onSortChange: (key: StockOverviewSortKey) => void
}

function SortButton({
  label,
  active,
  desc,
  onClick,
  className,
}: {
  label: string
  active: boolean
  desc: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={clsx(styles.sortBtn, active && styles.sortBtnActive, className)}
      onClick={onClick}
      aria-sort={active ? (desc ? 'descending' : 'ascending') : 'none'}
    >
      {label}
      {active ? <span className={styles.sortMark} aria-hidden>{desc ? '▼' : '▲'}</span> : null}
    </button>
  )
}

const SENTIMENT_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

function formatMentionChangeRate(value: number | null): string {
  if (value === null) return '—'
  if (value === 0) return '0%'
  return formatPercent(value)
}

export function StockOverviewTable({
  rows,
  sortKey,
  sortDesc,
  onSortChange,
}: StockOverviewTableProps) {
  const navigate = useNavigate()
  const { has: inWatchlist, toggle: toggleWatchlist, pendingCode } = useServerWatchlist()
  const snackbar = useTransientSnackbar()

  const goToStock = (code: string) => {
    navigate(buildStockDetailPath(code))
  }

  return (
    <section className={styles.section} aria-label="전체 종목 목록">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStock}>
                <SortButton
                  label="종목"
                  active={sortKey === 'name'}
                  desc={sortDesc}
                  onClick={() => onSortChange('name')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="현재가"
                  active={sortKey === 'price'}
                  desc={sortDesc}
                  onClick={() => onSortChange('price')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="등락"
                  active={sortKey === 'change'}
                  desc={sortDesc}
                  onClick={() => onSortChange('change')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="24h 언급량"
                  active={sortKey === 'mention'}
                  desc={sortDesc}
                  onClick={() => onSortChange('mention')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="언급률"
                  active={sortKey === 'mentionChange'}
                  desc={sortDesc}
                  onClick={() => onSortChange('mentionChange')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="감성"
                  active={sortKey === 'sentiment'}
                  desc={sortDesc}
                  onClick={() => onSortChange('sentiment')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="감성 변화"
                  active={sortKey === 'sentimentDelta'}
                  desc={sortDesc}
                  onClick={() => onSortChange('sentimentDelta')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  표시할 종목이 없습니다.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const priceDirection = priceChangeDirection(row.changePercent)
              const hasPrice = row.price > 0
              const mentionUp = row.mentionChangeRate24h != null && row.mentionChangeRate24h >= 0
              const sentKey = buzzSentimentClass(row.sentimentScore24h)
              const delta = formatSentimentDelta24h(row.sentimentDelta24h)
              const interested = inWatchlist(row.code)
              const watchlistPending = pendingCode === row.code
              return (
                <tr
                  key={row.code}
                  className={styles.rowRing}
                  tabIndex={0}
                  role="link"
                  aria-label={`${row.name} 종목 상세 보기`}
                  onClick={() => goToStock(row.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToStock(row.code)
                    }
                  }}
                >
                  <td className={styles.stockCell}>
                    <span className={styles.stockLead}>
                      <StockWatchlistStarButton
                        interested={interested}
                        pending={watchlistPending}
                        onToggle={() => {
                          void (async () => {
                            const result = await toggleWatchlist({
                              code: row.code,
                              name: row.name,
                              imageUrl: row.imageUrl,
                            })
                            if (result === 'added') {
                              snackbar.show('종목이 저장되었습니다.')
                              return
                            }
                            if (result === 'removed') {
                              snackbar.show('종목 저장이 취소되었습니다.', {
                                action: {
                                  label: '되돌리기',
                                  onAction: () => {
                                    void (async () => {
                                      let undoResult = await toggleWatchlist({
                                        code: row.code,
                                        name: row.name,
                                        imageUrl: row.imageUrl,
                                      })
                                      if (undoResult === 'pending') {
                                        await new Promise<void>((resolve) => {
                                          window.setTimeout(resolve, 120)
                                        })
                                        undoResult = await toggleWatchlist({
                                          code: row.code,
                                          name: row.name,
                                          imageUrl: row.imageUrl,
                                        })
                                      }
                                      if (undoResult === 'added') {
                                        snackbar.show('종목이 다시 저장되었습니다.')
                                      }
                                    })()
                                  },
                                },
                              })
                              return
                            }
                            if (result === 'error') {
                              snackbar.show('종목 저장 처리에 실패했습니다.')
                            }
                          })()
                        }}
                      />
                      <EntityAvatar
                        variant="stock"
                        size="sm"
                        name={row.name}
                        imageUrl={row.imageUrl}
                      />
                      <span className={styles.stockText}>
                        <span className={styles.stockName}>{row.name}</span>
                        <span className={styles.stockMeta}>
                          <span className={styles.stockCode}>{row.code}</span>
                          <span className={styles.stockMarket}>{row.market}</span>
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className={styles.mono}>
                    {hasPrice ? formatPrice(row.price) : '—'}
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      hasPrice && priceDirection === 'up' && styles.up,
                      hasPrice && priceDirection === 'down' && styles.down,
                    )}
                  >
                    {hasPrice ? formatPercent(row.changePercent) : '—'}
                  </td>
                  <td className={styles.mono}>
                    {row.mentionCount24h.toLocaleString('ko-KR')}
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      row.mentionChangeRate24h != null &&
                        row.mentionChangeRate24h !== 0 &&
                        (mentionUp ? styles.up : styles.down),
                    )}
                  >
                    {formatMentionChangeRate(row.mentionChangeRate24h)}
                  </td>
                  <td>
                    <span className={clsx(styles.mono, styles.sentScore, SENTIMENT_CLASS[sentKey])}>
                      {formatStockScore(row.sentimentScore24h)}
                    </span>
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      delta.tone === 'up' && styles.up,
                      delta.tone === 'down' && styles.down,
                      delta.tone === null && styles.deltaMuted,
                    )}
                    title={delta.title}
                  >
                    {delta.text}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {snackbar.message ? (
        <Snackbar
          message={snackbar.message}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.onAction}
        />
      ) : null}
    </section>
  )
}
