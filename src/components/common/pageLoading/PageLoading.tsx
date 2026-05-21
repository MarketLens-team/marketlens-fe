import clsx from 'clsx'
import type { ReactNode } from 'react'
import skeleton from '../Skeleton.module.css'
import { PageLoadingShell } from './PageLoadingShell'
import styles from './pageLoading.module.css'

export type PageLoadingVariant = 'stockDetail' | 'dashboard' | 'buzz' | 'list'

const LABELS: Record<PageLoadingVariant, string> = {
  stockDetail: '종목 상세 로딩',
  dashboard: '홈 대시보드 로딩',
  buzz: '언급량 급등 로딩',
  list: '리스트 페이지 로딩',
}

interface PageLoadingProps {
  variant: PageLoadingVariant
}

function Bone({ className }: { className: string }) {
  return <div className={clsx(skeleton.block, className)} />
}

function StockDetailLoading() {
  return (
    <div className={styles.stack}>
      <Bone className={styles.stockHeader} />
      <div className={styles.stockGrid}>
        <Bone className={styles.stockPanel} />
        <Bone className={styles.stockPanel} />
      </div>
      <Bone className={styles.stockPanelWide} />
      <Bone className={styles.stockNews} />
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className={styles.stack}>
      <div className={styles.dashboardTop}>
        <div className={styles.dashboardAside}>
          <Bone className={styles.dashboardGauge} />
          <Bone className={styles.dashboardBuzz} />
        </div>
        <Bone className={styles.dashboardWatchlist} />
      </div>
      <div className={styles.dashboardMarket}>
        <Bone className={styles.dashboardKospi} />
        <Bone className={styles.dashboardHeatmap} />
      </div>
    </div>
  )
}

function BuzzLoading() {
  return (
    <div className={styles.buzzGrid}>
      <div className={styles.buzzSummaryCol}>
        <Bone className={styles.buzzCard} />
        <Bone className={styles.buzzCard} />
        <Bone className={styles.buzzCard} />
      </div>
      <Bone className={styles.buzzTable} />
    </div>
  )
}

function ListLoading() {
  return (
    <div className={styles.stack}>
      <Bone className={styles.listHeader} />
      <Bone className={styles.listToolbar} />
      <div className={styles.listRows}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className={styles.listRow} />
        ))}
      </div>
    </div>
  )
}

const VARIANTS: Record<PageLoadingVariant, () => ReactNode> = {
  stockDetail: StockDetailLoading,
  dashboard: DashboardLoading,
  buzz: BuzzLoading,
  list: ListLoading,
}

export function PageLoading({ variant }: PageLoadingProps) {
  const Body = VARIANTS[variant]
  return (
    <PageLoadingShell label={LABELS[variant]}>
      <Body />
    </PageLoadingShell>
  )
}
