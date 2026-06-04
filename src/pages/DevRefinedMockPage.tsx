import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEV_REFINED_METRICS,
  DEV_REFINED_NEWS,
  DEV_REFINED_WATCHLIST,
  type DevRefinedWatchItem,
} from '../data/mocks/devRefinedDashboard.mock'
import styles from './DevRefinedMockPage.module.css'

function scoreClass(score: number): string {
  if (score > 0) return styles.up
  if (score < 0) return styles.down
  return ''
}

function sentimentClass(sentiment: string): string {
  if (sentiment === '긍정') return styles.sentimentPositive
  if (sentiment === '부정') return styles.sentimentNegative
  return ''
}

function formatScore(score: number): string {
  if (score > 0) return `+${score}`
  return String(score)
}

export default function DevRefinedMockPage() {
  const [watchlistEmpty, setWatchlistEmpty] = useState(false)
  const watchItems: DevRefinedWatchItem[] = watchlistEmpty ? [] : DEV_REFINED_WATCHLIST

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>Refined UI — 더미 대시보드</h1>
            <p className={styles.topbarDesc}>
              실제 API 없이 세련된 surface·리스트·메트릭 조합을 확인합니다.
            </p>
          </div>
          <nav className={styles.topbarLinks} aria-label="Dev 링크">
            <Link to="/dev/refined">패턴 가이드</Link>
            <Link to="/dev">Dev 홈</Link>
          </nav>
        </header>

        <aside className={styles.notice}>
          <span className={styles.noticeStrong}>더미 데이터</span>
          <p className={styles.noticeText}>
            모든 수치·뉴스는 프리뷰용입니다. 관심 종목 Empty 토글로 빈 화면도 확인할 수
            있어요.
          </p>
        </aside>

        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.toggle} ${!watchlistEmpty ? styles.toggleActive : ''}`}
            onClick={() => setWatchlistEmpty(false)}
          >
            관심 종목 있음
          </button>
          <button
            type="button"
            className={`${styles.toggle} ${watchlistEmpty ? styles.toggleActive : ''}`}
            onClick={() => setWatchlistEmpty(true)}
          >
            관심 종목 없음
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.column}>
            <section>
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.sectionLabel}>OVERVIEW</p>
                  <h2 className={styles.sectionTitle}>포트폴리오 요약</h2>
                  <p className={styles.sectionSub}>2026-05-19 · 장 마감 기준</p>
                </div>
              </div>
              <div className={styles.surface}>
                <div className={styles.metricGrid}>
                  {DEV_REFINED_METRICS.map((metric) => (
                    <article key={metric.id} className={styles.metricTile}>
                      <p className={styles.metricLabel}>{metric.label}</p>
                      <p className={styles.metricValue}>{metric.value}</p>
                      <p className={styles.metricCaption}>{metric.caption}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.sectionLabel}>WATCHLIST</p>
                  <h2 className={styles.sectionTitle}>관심 종목</h2>
                  <p className={styles.sectionSub}>실시간 감성 · 최근 24시간</p>
                </div>
                <button type="button" className={styles.ghostAction}>
                  전체 보기
                </button>
              </div>
              <div className={styles.surface}>
                {watchItems.length === 0 ? (
                  <div className={styles.empty}>
                    <h3 className={styles.emptyTitle}>관심 종목이 없어요</h3>
                    <p className={styles.emptyMessage}>
                      종목을 추가하면 감성 점수와 뉴스를 한곳에서 볼 수 있어요.
                    </p>
                    <div className={styles.emptyActions}>
                      <button type="button" className={styles.pillPrimary}>
                        종목 검색하기
                      </button>
                      <button type="button" className={styles.textLink}>
                        인기 종목 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className={styles.list}>
                    {watchItems.map((item) => (
                      <li key={item.id} className={styles.listRow}>
                        <div>
                          <p className={styles.listTitle}>{item.name}</p>
                          <p className={styles.listSub}>{item.code}</p>
                        </div>
                        <span className={`${styles.listValue} ${scoreClass(item.score)}`}>
                          {formatScore(item.score)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <div className={styles.column}>
            <section>
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.sectionLabel}>NEWS</p>
                  <h2 className={styles.sectionTitle}>최신 뉴스</h2>
                  <p className={styles.sectionSub}>관심 종목 연관 기사</p>
                </div>
                <button type="button" className={styles.ghostAction}>
                  전체 뉴스
                </button>
              </div>
              <div className={styles.surface}>
                <ul className={styles.list}>
                  {DEV_REFINED_NEWS.map((news) => (
                    <li key={news.id} className={styles.newsRow}>
                      <div>
                        <p className={styles.newsTime}>{news.time}</p>
                        <h3 className={styles.newsTitle}>{news.title}</h3>
                        <p className={styles.newsMeta}>{news.source}</p>
                      </div>
                      <span className={`${styles.sentiment} ${sentimentClass(news.sentiment)}`}>
                        {news.sentiment}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.sectionLabel}>SENTIMENT</p>
                  <h2 className={styles.sectionTitle}>감성 추이</h2>
                  <p className={styles.sectionSub}>최근 7일 · 더미 차트</p>
                </div>
              </div>
              <div className={styles.surface}>
                <div className={styles.chartPlaceholder}>CHART PLACEHOLDER</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
