import clsx from 'clsx'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import { StatTile } from '../components/common/StatTile'
import { NewsFeedSection } from '../components/dashboard/NewsFeedSection'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import skeleton from '../components/common/Skeleton.module.css'
import styles from './DashboardPage.module.css'

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardOverview()

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="대시보드"
          description="뉴스 기반 시장 감성과 버즈를 한 화면에서 요약합니다. 목·실API 전환은 환경 변수 VITE_USE_MOCK_DATA 로 제어합니다."
        />
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}
        <section className={styles.stats} aria-label="핵심 지표">
          {loading && !data
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} padding="md">
                  <div className={clsx(skeleton.block, skeleton.stat)} aria-hidden />
                </Card>
              ))
            : (data?.stats ?? []).map((s) => (
                <Card key={s.id} padding="md">
                  <StatTile
                    label={s.label}
                    value={s.value}
                    changePercent={s.changePercent}
                    hint={s.hint}
                  />
                </Card>
              ))}
        </section>
        <section className={styles.charts} aria-label="차트 영역">
          <Card padding="lg">
            <div className={styles.chartTitle}>Sentiment timeline</div>
            <div className={styles.chartBody}>
              {data?.sentimentTimeline?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sentimentTimeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      stroke="color-mix(in srgb, var(--color-text-primary) 6%, transparent)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="at"
                      tickFormatter={formatDayLabel}
                      stroke="var(--t3)"
                      tick={{ fill: 'var(--t2)', fontSize: 12, fontFamily: 'var(--mono)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--t3)"
                      tick={{ fill: 'var(--t2)', fontSize: 12, fontFamily: 'var(--mono)' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
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
                    <Line type="monotone" dataKey="score" stroke="var(--G)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartPlaceholder}>데이터 로딩 중…</div>
              )}
            </div>
          </Card>
          <Card padding="lg">
            <div className={styles.chartTitle}>Sector heat</div>
            <div className={styles.chartBody}>
              {data?.sectorHeat?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sectorHeat} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid
                      stroke="color-mix(in srgb, var(--color-text-primary) 6%, transparent)"
                      horizontal={false}
                    />
                    <XAxis type="number" stroke="var(--t3)" tick={{ fill: 'var(--t2)', fontSize: 12 }} hide />
                    <YAxis
                      type="category"
                      dataKey="sectorName"
                      width={88}
                      stroke="var(--t3)"
                      tick={{ fill: 'var(--t2)', fontSize: 12, fontFamily: 'var(--sans)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="buzzCount"
                      fill="color-mix(in srgb, var(--color-success) 28%, transparent)"
                      stroke="color-mix(in srgb, var(--color-success) 55%, transparent)"
                      strokeWidth={1}
                      radius={[0, 2, 2, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartPlaceholder}>데이터 로딩 중…</div>
              )}
            </div>
          </Card>
        </section>
        <NewsFeedSection />
      </div>
    </Layout>
  )
}
