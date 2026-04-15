import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './DevLayoutSplitPage.module.css'

type ViewMode = 'home' | 'detail'

const topMenus = ['섹터', '종목', '인물', '뉴스'] as const

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
  { section: 'OVERVIEW', items: ['개요', '핵심 지표', '감성 스냅샷'] },
  { section: 'ANALYSIS', items: ['타임라인', '연관 뉴스', '인물/섹터'] },
  { section: 'RISK', items: ['리스크 플래그', '이상 징후', '알림 설정'] },
] as const

export default function DevLayoutSplitPage() {
  const [mode, setMode] = useState<ViewMode>('home')

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

      <header className={styles.appTopbar}>
        <div className={styles.brandWrap}>
          <span className={styles.brandLogo} aria-hidden>
            M
          </span>
          <div className={styles.brand}>MarketLens</div>
        </div>
        <nav className={styles.homeNav} aria-label="상단 메뉴">
          {topMenus.map((menu) => (
            <button key={menu} type="button">
              {menu}
            </button>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.watchlistWrap}>
            <button type="button" className={styles.utilityButton} aria-haspopup="dialog">
              <span className={styles.utilityStar} aria-hidden>
                ★
              </span>
              관심 목록
            </button>
            <section className={styles.watchlistPanel} aria-label="관심 목록 패널">
              <header className={styles.watchlistHeader}>
                <h3>My First Watchlist</h3>
                <button type="button">전체 보기</button>
              </header>
              <div className={styles.watchlistTabs}>
                <button type="button" className={styles.watchlistTabActive}>
                  종목
                </button>
                <button type="button" className={styles.watchlistTab}>
                  섹터
                </button>
                <button type="button" className={styles.watchlistTab}>
                  인물
                </button>
              </div>
              <div className={styles.watchlistBody}>
                <p className={styles.watchlistLead}>관심 항목 추가하기</p>
                <div className={styles.watchlistChips}>
                  <button type="button">삼성전자 +</button>
                  <button type="button">반도체 +</button>
                  <button type="button">이재용 +</button>
                  <button type="button">SK하이닉스 +</button>
                  <button type="button">2차전지 +</button>
                </div>
              </div>
            </section>
          </div>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <input className={styles.search} placeholder="검색" />
          </div>
          <button type="button" className={styles.circleButton} aria-label="설정">
            ⚙
          </button>
        </div>
      </header>

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
            <div className={styles.detailTitle}>005930 · 삼성전자</div>
            {detailMenus.map((group) => (
              <div key={group.section} className={styles.detailGroup}>
                <p>{group.section}</p>
                {group.items.map((item, idx) => (
                  <button key={item} type="button" className={idx === 0 ? styles.detailActive : styles.detailItem}>
                    {item}
                  </button>
                ))}
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
              <div>감성 점수 트렌드</div>
              <div>연관 뉴스 클러스터</div>
              <div>리스크 신호 히스토리</div>
            </div>
          </article>
        </section>
      )}

      <footer className={styles.footerLinks}>
        <Link to="/dev">/dev 돌아가기</Link>
      </footer>
    </main>
  )
}
