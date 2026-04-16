import { Link } from 'react-router-dom'
import { DevTopNavigation } from '../components/common/DevTopNavigation'
import styles from './DevLayoutHomePreviewPage.module.css'

const metricCards = [
  { label: 'Market Sentiment', value: '+62', sub: '+4.1% vs yesterday' },
  { label: 'Active Buzz', value: '128', sub: '18 high-volatility topics' },
  { label: 'News Flow', value: '2.4k', sub: 'last 24h indexed' },
  { label: 'Risk Flags', value: '7', sub: '3 severe, 4 moderate' },
] as const

const latestNews = [
  { time: '17m ago', title: '반도체 수급 기대감 확대', source: 'MarketWire', tone: '긍정' },
  { time: '29m ago', title: '환율 변동성 확대, 수입주 주의', source: 'FinPulse', tone: '중립' },
  { time: '45m ago', title: '2차전지 단기 과열 신호', source: 'Alpha Desk', tone: '부정' },
  { time: '1h ago', title: 'AI 인프라 투자 확대 전망', source: 'Tech Macro', tone: '긍정' },
] as const

export default function DevLayoutHomePreviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.devTopbar}>
        <h1>Dev Layout — 홈 (사이드바 없음)</h1>
      </div>

      <DevTopNavigation />

      <section className={styles.homeView}>
        <section className={styles.metrics}>
          {metricCards.map((card) => (
            <article key={card.label} className={styles.metricCard}>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <small>{card.sub}</small>
            </article>
          ))}
        </section>

        <section className={styles.homeBody}>
          <article className={styles.newsColumn}>
            <div className={styles.sectionTitle}>
              <h2>Latest News</h2>
              <button type="button">전체 뉴스 보기</button>
            </div>
            <ul className={styles.newsList}>
              {latestNews.map((news) => (
                <li key={news.title} className={styles.newsItem}>
                  <div>
                    <p className={styles.newsTime}>{news.time}</p>
                    <h3>{news.title}</h3>
                    <p className={styles.newsMeta}>{news.source}</p>
                  </div>
                  <span className={styles.tone}>{news.tone}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.mainViz}>
            <h2>Sentiment Timeline</h2>
            <div className={styles.mockChart}>TIMELINE CHART AREA</div>
            <h2>Sector Heat</h2>
            <div className={styles.mockHeat}>SECTOR HEAT AREA</div>
          </article>
        </section>
      </section>

      <footer className={styles.footerLinks}>
        <Link to="/dev/layout-split">상세 split 프리뷰</Link>
        <Link to="/dev">/dev 돌아가기</Link>
      </footer>
    </main>
  )
}
