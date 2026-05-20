import clsx from 'clsx'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { CardSectionHeader } from '../components/common/CardSectionHeader'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { useAdminStocks } from '../hooks/useAdminStocks'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import styles from './AdminStocksPage.module.css'

export default function AdminStocksPage() {
  const { data, loading, error } = useAdminStocks()

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout hideSidebar={false}>
      <div className={styles.page}>
        <PageHeader
          title="종목 관리"
          description="`stock` + 뉴스 수집 시각 집계. GET /api/v1/admin/stocks"
        />
        {error ? (
          <PageFetchError title="종목 목록을 불러오지 못했어요" message={error.message} />
        ) : null}
        <Card padding="none" className={styles.feedCard}>
          <CardSectionHeader title="등록 종목" subtitle="코드 · 이름 · 시장 · 상태 · 마지막 기사 수집" />
          {loading && !data && !error ? (
            <div className={styles.skeletonTable} aria-busy="true" aria-label="종목 목록 로딩">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonRow}>
                  <div className={clsx(skeleton.block, skeleton.tableLine)} />
                </div>
              ))}
            </div>
          ) : (data ?? []).length === 0 ? (
            <p className={skeleton.empty}>등록된 종목이 없습니다</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">코드</th>
                    <th scope="col">이름</th>
                    <th scope="col">시장</th>
                    <th scope="col">상태</th>
                    <th scope="col">마지막 기사 수집</th>
                  </tr>
                </thead>
                <tbody>
                  {(data ?? []).map((row) => {
                    const active = row.deletedAt === null
                    return (
                      <tr key={row.stockId}>
                        <td className={styles.mono}>{row.stockCode}</td>
                        <td>{row.stockName}</td>
                        <td className={styles.mono}>{row.market}</td>
                        <td>
                          <span className={active ? styles.badgeOn : styles.badgeOff}>
                            {active ? '활성' : '삭제됨'}
                          </span>
                        </td>
                        <td className={styles.mono}>
                          {row.lastNewsCrawledAt
                            ? new Date(row.lastNewsCrawledAt).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
