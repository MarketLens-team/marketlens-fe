import clsx from 'clsx'
import { CardSectionHeader } from '../components/common/CardSectionHeader'
import { Card } from '../components/common/Card'
import {
  DetailMainGroup,
  DetailMainGroupPlaceholder,
  DetailSplitShell,
  type DetailAccordionSidebarGroup,
} from '../components/common/DetailSplitShell'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { useBuzzAlerts } from '../hooks/useBuzzAlerts'
import styles from './BuzzAlertPage.module.css'

type BuzzSidebarKey = 'overview' | 'alerts' | 'news'

const buzzSidebarGroups: DetailAccordionSidebarGroup<BuzzSidebarKey>[] = [
  {
    key: 'overview',
    section: '개요',
    icon: '📣',
    items: [
      { id: 'buzz-overview', label: '버즈 개요' },
      { id: 'buzz-spike', label: '스파이크 요약' },
    ],
  },
  {
    key: 'alerts',
    section: '알림',
    icon: '🚨',
    items: [
      { id: 'buzz-alert-feed', label: '알림 피드' },
      { id: 'buzz-related', label: '연관 종목' },
    ],
  },
  {
    key: 'news',
    section: '뉴스',
    icon: '📰',
    items: [{ id: 'buzz-news', label: '버즈 뉴스' }],
  },
]

export default function BuzzAlertPage() {
  const { data, loading, error } = useBuzzAlerts()

  return (
    <Layout>
      <DetailSplitShell groups={buzzSidebarGroups}>
        <DetailMainGroup>
          <PageHeader
            title="버즈 알림"
            description="급증 언급·이상 감성 구간을 추적합니다. buzzClient → GET /api/v1/buzz/alerts"
          />
          {error ? (
            <p className={styles.bannerError} role="alert">
              {error.message}
            </p>
          ) : null}
        </DetailMainGroup>
        <DetailMainGroup>
          <Card padding="none" className={styles.feedCard}>
            <CardSectionHeader title="알림 피드" subtitle="토픽 · 스파이크 · 관련 종목" />
            {loading && !data ? (
              <div className={styles.skeletonList} aria-busy="true" aria-label="버즈 알림 로딩">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={clsx(skeleton.block, skeleton.rowMd)} />
                ))}
              </div>
            ) : (data ?? []).length === 0 ? (
              <p className={skeleton.empty}>활성 알림이 없습니다</p>
            ) : (
              <ul className={styles.list}>
                {(data ?? []).map((b) => (
                  <li key={b.id} className={styles.item}>
                    <div className={styles.top}>
                      <p className={styles.topic}>{b.topic}</p>
                      <span className={styles.spike}>spike ×{b.spikeScore.toFixed(1)}</span>
                    </div>
                    <div className={styles.bottom}>
                      <span className={styles.stocks}>
                        {b.relatedStocks.length ? b.relatedStocks.join(', ') : '관련 종목 없음'}
                      </span>
                      <time className={styles.time} dateTime={b.detectedAt}>
                        {new Date(b.detectedAt).toLocaleString()}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </DetailMainGroup>
        <DetailMainGroup>
          <DetailMainGroupPlaceholder>버즈 뉴스 피드는 다음 단계에서 연결 예정입니다.</DetailMainGroupPlaceholder>
        </DetailMainGroup>
      </DetailSplitShell>
    </Layout>
  )
}
