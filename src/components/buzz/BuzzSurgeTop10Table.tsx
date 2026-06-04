import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { AiSummaryText } from '../common/AiSummaryText'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { BuzzSurgeRow } from '../../data/types/buzzSurge'
import {
  buzzSentimentClass,
  formatStockScore,
  formatSurgePercent,
  type BuzzSentimentTone,
} from './buzzSurgeScore'
import styles from './BuzzSurgeTop10Table.module.css'

const SENTIMENT_SCORE_CLASS: Record<BuzzSentimentTone, string> = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
}

interface BuzzSurgeTop10TableProps {
  items: BuzzSurgeRow[]
}

export function BuzzSurgeTop10Table({ items }: BuzzSurgeTop10TableProps) {
  const navigate = useNavigate()

  const goToStock = (code: string) => {
    navigate(`/stock/${code}`)
  }

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader
        title="언급량 급등 TOP 10"
        subtitle="어제 대비 뉴스 언급량 급등 순"
        variant="embedded"
      />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.colRank}>
                #
              </th>
              <th scope="col" className={styles.colStock}>
                종목
              </th>
              <th scope="col" className={styles.colNum}>
                오늘 건수
              </th>
              <th scope="col" className={styles.colNum}>
                언급량 급등
              </th>
              <th scope="col" className={styles.colSentiment}>
                감성
              </th>
              <th scope="col" className={styles.colSummary}>
                AI 요약 (왜?)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const sentKey = buzzSentimentClass(row.sentimentScore)
              return (
                <tr
                  key={row.stockCode}
                  className={styles.rowClickable}
                  tabIndex={0}
                  role="link"
                  aria-label={`${row.stockName} 종목 상세 보기`}
                  onClick={() => goToStock(row.stockCode)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToStock(row.stockCode)
                    }
                  }}
                >
                  <td className={clsx(styles.mono, styles.rank)}>{row.rank}</td>
                  <td className={styles.stockCell}>
                    <span className={styles.stockName}>{row.stockName}</span>
                  </td>
                  <td className={styles.mono}>{row.currentMentionCount}</td>
                  <td className={clsx(styles.mono, styles.surge)}>{formatSurgePercent(row.surgePercent)}</td>
                  <td>
                    <span className={clsx(styles.mono, styles.sentScore, SENTIMENT_SCORE_CLASS[sentKey])}>
                      {formatStockScore(row.sentimentScore)}
                    </span>
                  </td>
                  <td className={styles.summary}>
                    <AiSummaryText text={row.aiSummary} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
