import clsx from 'clsx'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { Card } from '../common/Card'
import { NewsListRow } from '../common/NewsListRow'
import { Modal } from '../ui/Modal'
import { useNewsFeed } from '../../hooks/useNewsFeed'
import type { NewsFeedItem } from '../../data/types/news'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import skeleton from '../common/Skeleton.module.css'
import styles from './NewsFeedSection.module.css'

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function scoreText(score: number): string {
  if (score > 0) return `+${score}`
  return String(score)
}

function trendStroke(points: { score: number }[]): string {
  if (!points.length) return 'var(--t2)'
  const last = points[points.length - 1].score
  if (last > 0) return 'var(--G)'
  if (last < 0) return 'var(--R)'
  return 'var(--t2)'
}

export function NewsFeedSection() {
  const { data, loading, error } = useNewsFeed()
  const [open, setOpen] = useState<NewsFeedItem | null>(null)

  return (
    <section className={styles.section} aria-label="뉴스 피드">
      <Card padding="none" className={styles.card}>
        <CardSectionHeader
          title="전체 뉴스"
          subtitle="감성 분석 커버리지 · 버즈 · 종목 감성 추이 (목 데이터)"
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        ) : null}
        {loading && !data ? (
          <div className={styles.skeletonList} aria-busy="true" aria-label="뉴스 목록 로딩">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={clsx(skeleton.block, skeleton.rowNews)} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {(data ?? []).map((item) => (
              <NewsListRow key={item.id} item={item} onOpen={() => setOpen(item)} />
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={open !== null}
        onClose={() => setOpen(null)}
        contentClassName={styles.modalContent}
      >
        {open ? (
          <div className={styles.dialogPanel}>
            <div className={styles.dialogInner}>
              <div className={styles.dialogTop}>
                <h2 className={styles.dialogTitle}>{open.title}</h2>
                <button
                  type="button"
                  className={styles.closeBtn}
                  aria-label="닫기"
                  onClick={() => setOpen(null)}
                >
                  ×
                </button>
              </div>
              <p className={styles.dialogMeta}>
                <span>{formatRelativeTimeKo(open.publishedAt)}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaSource}>{open.source}</span>
                {open.reporter ? (
                  <>
                    <span className={styles.metaSep}>·</span>
                    <span>{open.reporter}</span>
                  </>
                ) : null}
              </p>

              <div className={styles.metricBar}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>분석 커버</span>
                  <span className={styles.metricValue}>{open.coverage.percent}%</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>버즈</span>
                  <span className={styles.metricValue}>{open.buzzScore}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>뉴스 감성</span>
                  <span
                    className={
                      open.sentimentScore > 0
                        ? styles.metricScorePos
                        : open.sentimentScore < 0
                          ? styles.metricScoreNeg
                          : styles.metricScoreNeu
                    }
                  >
                    {scoreText(open.sentimentScore)}
                  </span>
                </div>
              </div>
              <p className={styles.scopeLine}>
                <span className={styles.scopeLabel}>적용 구간</span>
                {open.coverage.scopes.map((s) => (
                  <span key={s} className={styles.chip}>
                    {s}
                  </span>
                ))}
              </p>
              <p className={styles.entityLine}>{open.coverage.entitySummary}</p>

              <div className={styles.trendHead}>
                <span className={styles.trendTitle}>{open.primaryTicker.name}</span>
                <span className={styles.trendCode}>{open.primaryTicker.code}</span>
                <span className={styles.trendHint}>관련 뉴스 감성 추이 (목)</span>
              </div>
              <div className={styles.trendChart}>
                {open.sentimentTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={open.sentimentTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid
                        stroke="color-mix(in srgb, var(--color-text-primary) 6%, transparent)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="at"
                        tickFormatter={formatDayLabel}
                        stroke="var(--t3)"
                        tick={{ fill: 'var(--t2)', fontSize: 10, fontFamily: 'var(--mono)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--t3)"
                        tick={{ fill: 'var(--t2)', fontSize: 10, fontFamily: 'var(--mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg2)',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                        labelFormatter={(v) => new Date(String(v)).toLocaleString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={trendStroke(open.sentimentTrend)}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              {open.imageUrl ? (
                <img className={styles.hero} src={open.imageUrl} alt="" width={800} height={420} loading="lazy" />
              ) : null}
              <div className={styles.body}>{open.body}</div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
