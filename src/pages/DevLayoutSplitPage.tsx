import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DevTopNavigation } from '../components/common/DevTopNavigation'
import styles from './DevLayoutSplitPage.module.css'

type ViewMode = 'home' | 'detail'
type SidebarGroupKey = 'markets' | 'indicators' | 'etf'

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

const detailMenus = [
  {
    key: 'markets',
    section: 'Markets',
    icon: '📈',
    items: ['시장 개요', '섹터 동향', '테마 랭킹', '시장 캘린더', '거래량 급증', '이슈 브리프'],
  },
  {
    key: 'indicators',
    section: 'Indicators',
    icon: '🪄',
    items: ['감성 지수', '버즈 스코어', '리스크 레벨', '연관 인물 지수', '연관 종목 지수', '섹터 온도'],
  },
  {
    key: 'etf',
    section: 'News',
    icon: '📰',
    items: ['섹터 뉴스', '종목 뉴스', '인물 뉴스', '속보 알림'],
  },
] as const

const detailStatMocks = [
  { label: '감성 지수', value: '56', change: '+4.2%' },
  { label: '버즈 스파이크', value: '128', change: '+18' },
  { label: '리스크 알림', value: '7', change: '-2' },
  { label: '연관 인물 수', value: '23', change: '+3' },
  { label: '연관 종목 수', value: '41', change: '+5' },
  { label: '핵심 뉴스 건수', value: '89', change: '+12' },
] as const

const detailNewsMocks = [
  { title: '반도체 섹터 순매수 전환', tag: '섹터 뉴스', time: '12분 전' },
  { title: 'A사 가이던스 상향 발표', tag: '종목 뉴스', time: '26분 전' },
  { title: '정책 브리핑 이후 변동성 확대', tag: '인물 뉴스', time: '41분 전' },
  { title: '2차전지 테마 거래대금 급증', tag: '섹터 뉴스', time: '55분 전' },
  { title: 'B사 신규 수주 공시 발표', tag: '종목 뉴스', time: '1시간 전' },
  { title: '핵심 인사 인터뷰 이후 매수세 유입', tag: '인물 뉴스', time: '1시간 24분 전' },
  { title: '미국 지표 발표 전 관망세 확대', tag: '속보 알림', time: '1시간 52분 전' },
] as const

export default function DevLayoutSplitPage() {
  const [mode, setMode] = useState<ViewMode>('home')
  const [collapsed, setCollapsed] = useState<Record<SidebarGroupKey, boolean>>({
    markets: false,
    indicators: false,
    etf: true,
  })

  const toggleGroup = (key: SidebarGroupKey) => {
    setCollapsed((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  const activeItem = '감성 지수'

  return (
    <main className={styles.page}>
      <div className={styles.devTopbar}>
        <h1>Dev Layout Split Preview</h1>
        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={mode === 'home' ? styles.activeButton : styles.switchButton}
            onClick={() => setMode('home')}
          >
            홈 (사이드바 없음)
          </button>
          <button
            type="button"
            className={mode === 'detail' ? styles.activeButton : styles.switchButton}
            onClick={() => setMode('detail')}
          >
            상세 (CMC 스타일 사이드바)
          </button>
        </div>
      </div>

      <DevTopNavigation />

      {mode === 'home' ? (
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
      ) : (
        <section className={styles.detailView}>
          <aside className={styles.detailSidebar}>
            {detailMenus.map((group) => (
              <div key={group.section} className={styles.detailGroup}>
                <button
                  type="button"
                  className={styles.detailGroupToggle}
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={!collapsed[group.key]}
                >
                  <span className={styles.groupHead}>
                    <span className={styles.groupIcon} aria-hidden>
                      {group.icon}
                    </span>
                    {group.section}
                  </span>
                  <span className={styles.detailChevron}>{collapsed[group.key] ? '▸' : '▾'}</span>
                </button>
                {!collapsed[group.key]
                  ? (
                      <div className={styles.detailMenuRail}>
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={item === activeItem ? styles.detailActive : styles.detailItem}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )
                  : null}
              </div>
            ))}
          </aside>

          <article className={styles.detailContent}>
            <h2>상세 페이지 레이아웃 프리뷰</h2>
            <p>
              상세 라우트 진입 시에만 좌측 사이드바를 보이는 구조를 가정했습니다. 본문 영역은 분석 차트,
              뉴스 타임라인, 리스크 이벤트 카드가 들어오는 자리입니다.
            </p>
            <div className={styles.detailCards}>
              {detailStatMocks.map((card) => (
                <div key={card.label} className={styles.detailStatCard}>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                  <small>{card.change}</small>
                </div>
              ))}
            </div>
            <section className={styles.detailFeed}>
              <h3>테스트 뉴스 피드</h3>
              <ul className={styles.detailFeedList}>
                {detailNewsMocks.map((news) => (
                  <li key={news.title} className={styles.detailFeedItem}>
                    <span>{news.tag}</span>
                    <p>{news.title}</p>
                    <time>{news.time}</time>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </section>
      )}

      <footer className={styles.footerLinks}>
        <Link to="/dev">/dev 돌아가기</Link>
      </footer>
    </main>
  )
}
