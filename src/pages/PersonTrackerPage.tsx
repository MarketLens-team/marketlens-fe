import clsx from 'clsx'
import { CardSectionHeader } from '../components/common/CardSectionHeader'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { usePersonMentions } from '../hooks/usePersonMentions'
import styles from './PersonTrackerPage.module.css'

function sentimentClass(s: 'positive' | 'negative' | 'neutral') {
  if (s === 'positive') return styles.sentPos
  if (s === 'negative') return styles.sentNeg
  return styles.sentNeu
}

export default function PersonTrackerPage() {
  const { data, loading, error } = usePersonMentions()

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="인물 발언"
          description="핵심 인물의 언급과 감성을 모읍니다. personClient → GET /api/v1/persons/mentions"
        />
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}
        <Card padding="none" className={styles.feedCard}>
          <CardSectionHeader title="언급 피드" subtitle="인물 · 역할 · 맥락 · 관련 종목" />
          {loading && !data ? (
            <div className={styles.skeletonList} aria-busy="true" aria-label="인물 언급 로딩">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, skeleton.rowLg)} />
              ))}
            </div>
          ) : (data ?? []).length === 0 ? (
            <p className={skeleton.empty}>표시할 언급이 없습니다</p>
          ) : (
            <ul className={styles.list}>
              {(data ?? []).map((m) => (
                <li key={m.id} className={styles.item}>
                  <div className={styles.row}>
                    <span className={styles.name}>{m.personName}</span>
                    <span className={styles.role}>{m.role}</span>
                    <span className={sentimentClass(m.sentiment)}>{m.sentiment}</span>
                  </div>
                  <p className={styles.context}>{m.context}</p>
                  <div className={styles.footer}>
                    <span className={styles.codes}>
                      {m.stockCodes.length ? m.stockCodes.join(', ') : '—'}
                    </span>
                    <time className={styles.time} dateTime={m.publishedAt}>
                      {new Date(m.publishedAt).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  )
}
