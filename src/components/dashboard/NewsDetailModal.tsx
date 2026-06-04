import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NewsFeedItem } from '../../data/types/news'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import { Modal } from '../ui/Modal'
import styles from './NewsDetailModal.module.css'

interface NewsDetailModalProps {
  item: NewsFeedItem | null
  onClose: () => void
}

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function scoreText(score: number): string {
  if (score > 0) return `+${score}`
  return String(score)
}

function trendStroke(points: { score: number }[]): string {
  if (!points.length) return 'var(--color-text-secondary)'
  const last = points[points.length - 1].score
  if (last > 0) return 'var(--color-success)'
  if (last < 0) return 'var(--color-danger)'
  return 'var(--color-text-secondary)'
}

export function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  return (
    <Modal
      isOpen={item !== null}
      onClose={onClose}
      title={item?.title}
      headerMeta={item ? (
        <p className={styles.dialogMeta}>
          <span>{formatRelativeTimeKo(item.publishedAt)}</span>
          <span className={styles.metaSep}>·</span>
          <span className={styles.metaSource}>{item.source}</span>
          {item.reporter ? (
            <>
              <span className={styles.metaSep}>·</span>
              <span>{item.reporter}</span>
            </>
          ) : null}
        </p>
      ) : null}
      contentClassName={styles.modalContent}
      bodyClassName={styles.modalBody}
    >
      {item ? (
        <div className={styles.dialogPanel}>
          <div className={styles.metricBar}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>분석 커버</span>
              <span className={styles.metricValue}>{item.coverage.percent}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>버즈</span>
              <span className={styles.metricValue}>{item.buzzScore}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>뉴스 감성</span>
              <span
                className={
                  item.sentimentScore > 0
                    ? styles.metricScorePos
                    : item.sentimentScore < 0
                      ? styles.metricScoreNeg
                      : styles.metricScoreNeu
                }
              >
                {scoreText(item.sentimentScore)}
              </span>
            </div>
          </div>
          <p className={styles.scopeLine}>
            <span className={styles.scopeLabel}>적용 구간</span>
            {item.coverage.scopes.map((scope) => (
              <span key={scope} className={styles.chip}>
                {scope}
              </span>
            ))}
          </p>
          <p className={styles.entityLine}>{item.coverage.entitySummary}</p>

          <div className={styles.trendHead}>
            <span className={styles.trendTitle}>{item.primaryTicker.name}</span>
            <span className={styles.trendCode}>{item.primaryTicker.code}</span>
            <span className={styles.trendHint}>관련 뉴스 감성 추이 (목)</span>
          </div>
          <div className={styles.trendChart}>
            {item.sentimentTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.sentimentTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    stroke="color-mix(in srgb, var(--color-text-primary) 6%, transparent)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="at"
                    tickFormatter={formatDayLabel}
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-section)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => new Date(String(v)).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={trendStroke(item.sentimentTrend)}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          {item.imageUrl ? (
            <img className={styles.hero} src={item.imageUrl} alt="" width={800} height={420} loading="lazy" />
          ) : null}
          <div className={styles.body}>{item.body}</div>
        </div>
      ) : null}
    </Modal>
  )
}
