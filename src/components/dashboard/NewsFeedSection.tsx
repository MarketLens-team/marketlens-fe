import clsx from 'clsx'
import { useState } from 'react'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { Card } from '../common/Card'
import { NewsListRow } from '../common/NewsListRow'
import { NewsDetailModal } from './NewsDetailModal'
import { useNewsFeed } from '../../hooks/useNewsFeed'
import type { NewsFeedItem } from '../../data/types/news'
import skeleton from '../common/Skeleton.module.css'
import styles from './NewsFeedSection.module.css'

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

      <NewsDetailModal item={open} onClose={() => setOpen(null)} />
    </section>
  )
}
