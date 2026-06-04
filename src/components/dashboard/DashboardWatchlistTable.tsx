import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { buzzSentimentClass, formatStockScore } from '../buzz/buzzSurgeScore'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EntityAvatar } from '../ui/EntityAvatar'
import { formatPercent, formatPrice } from '../stock/stockScore'
import { useAuthStore } from '../../store/authStore'
import type { DashboardWatchlistRow } from '../../data/types/dashboard'
import { DashboardLoginPrompt } from './DashboardLoginPrompt'
import styles from './DashboardWatchlistTable.module.css'

interface DashboardWatchlistTableProps {
  rows: DashboardWatchlistRow[]
  className?: string
}

const SENTIMENT_SCORE_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

function formatPriceCell(price: number): string {
  return price > 0 ? formatPrice(price) : '—'
}

function formatChangeCell(changePercent: number): string {
  if (changePercent === 0) return '—'
  return formatPercent(changePercent)
}

function formatMentionSurge(value: number): string {
  if (value === 0) return '—'
  return formatPercent(value)
}

export function DashboardWatchlistTable({ rows, className }: DashboardWatchlistTableProps) {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const goToStock = (code: string) => {
    navigate(`/stock/${code}`)
  }

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader title="내 관심 종목 워치리스트" variant="embedded" />
      {!isLoggedIn ? (
        <DashboardLoginPrompt
          className={styles.loginPrompt}
          title="로그인이 필요해요"
          message="로그인하면 관심 종목 워치리스트를 확인할 수 있어요."
        />
      ) : null}
      {isLoggedIn ? (
        <div className={styles.listWrap}>
          <div className={styles.list}>
            <div className={styles.watchHeader}>
              <div>종목</div>
              <div>현재가</div>
              <div>등락</div>
              <div>감성</div>
              <div>뉴스</div>
              <div>언급률</div>
            </div>
            {rows.length === 0 ? (
              <p className={styles.empty}>관심종목이 없습니다. 종목 상세에서 추가해 보세요.</p>
            ) : (
              <>
                {rows.map((row) => {
                  const hasPrice = row.price > 0
                  const priceUp = row.changePercent >= 0
                  const mentionUp = row.mentionSurgePercent >= 0
                  const sentKey = buzzSentimentClass(row.sentimentScore)
                  return (
                    <div
                      key={row.code}
                      className={styles.watchRow}
                      role="link"
                      tabIndex={0}
                      aria-label={`${row.name} 종목 상세 보기`}
                      onClick={() => goToStock(row.code)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          goToStock(row.code)
                        }
                      }}
                    >
                      <div className={styles.stockCell}>
                        <span className={styles.stockLead}>
                          <EntityAvatar
                            variant="stock"
                            size="sm"
                            name={row.name}
                            imageUrl={row.imageUrl}
                          />
                          <span className={styles.stockText}>
                            <span className={styles.stockName}>{row.name}</span>
                            <span className={styles.stockCode}>{row.code}</span>
                          </span>
                        </span>
                      </div>
                      <div className={styles.mono}>{formatPriceCell(row.price)}</div>
                      <div
                        className={clsx(
                          styles.mono,
                          hasPrice && (priceUp ? styles.up : styles.down),
                        )}
                      >
                        {formatChangeCell(row.changePercent)}
                      </div>
                      <div>
                        <span
                          className={clsx(
                            styles.mono,
                            styles.sentScore,
                            SENTIMENT_SCORE_CLASS[sentKey],
                          )}
                        >
                          {formatStockScore(row.sentimentScore)}
                        </span>
                      </div>
                      <div className={styles.mono}>{row.newsCount.toLocaleString('ko-KR')}</div>
                      <div
                        className={clsx(
                          styles.mono,
                          row.mentionSurgePercent !== 0 && (mentionUp ? styles.up : styles.down),
                        )}
                      >
                        {formatMentionSurge(row.mentionSurgePercent)}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
