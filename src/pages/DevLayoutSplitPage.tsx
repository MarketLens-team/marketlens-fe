import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DetailAccordionSidebar, type DetailAccordionSidebarGroup } from '../components/common/DetailAccordionSidebar'
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

const detailMenus: DetailAccordionSidebarGroup<SidebarGroupKey>[] = [
  {
    key: 'markets',
    section: 'Markets',
    icon: '📈',
    items: [
      { id: 'market-overview', label: '시장 개요' },
      { id: 'sector-trend', label: '섹터 동향' },
      { id: 'theme-ranking', label: '테마 랭킹' },
      { id: 'market-calendar', label: '시장 캘린더' },
      { id: 'volume-spike', label: '거래량 급증' },
      { id: 'issue-brief', label: '이슈 브리프' },
    ],
  },
  {
    key: 'indicators',
    section: 'Indicators',
    icon: '🪄',
    items: [
      { id: 'sentiment-index', label: '감성 지수' },
      { id: 'buzz-score', label: '버즈 스코어' },
      { id: 'risk-level', label: '리스크 레벨' },
      { id: 'person-index', label: '연관 인물 지수' },
      { id: 'stock-index', label: '연관 종목 지수' },
      { id: 'sector-temp', label: '섹터 온도' },
    ],
  },
  {
    key: 'etf',
    section: 'News',
    icon: '📰',
    items: [
      { id: 'sector-news', label: '섹터 뉴스' },
      { id: 'stock-news', label: '종목 뉴스' },
      { id: 'person-news', label: '인물 뉴스' },
      { id: 'breaking-news', label: '속보 알림' },
    ],
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
  const allDetailItems = useMemo(
    () =>
      detailMenus.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          groupKey: group.key,
          groupTitle: group.section,
        })),
      ),
    [],
  )
  const itemToGroupKey = useMemo(
    () =>
      Object.fromEntries(allDetailItems.map((item) => [item.id, item.groupKey])) as Record<string, SidebarGroupKey>,
    [allDetailItems],
  )
  const [activeItem, setActiveItem] = useState<string>(allDetailItems[0]?.id ?? '')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const activeLockRef = useRef(false)
  const lockTimerRef = useRef<number | null>(null)

  const toggleGroup = (key: SidebarGroupKey) => {
    setCollapsed((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  useEffect(() => {
    if (mode !== 'detail') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (activeLockRef.current) return

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const nextId = visibleEntries[0]?.target.id
        if (!nextId) return

        setActiveItem(nextId)
        const nextGroupKey = itemToGroupKey[nextId]
        if (!nextGroupKey) return
        setCollapsed((prev) => {
          if (!prev[nextGroupKey]) return prev
          return { ...prev, [nextGroupKey]: false }
        })
      },
      {
        threshold: [0.35, 0.6, 0.8],
        rootMargin: '-16% 0px -48% 0px',
      },
    )

    allDetailItems.forEach((item) => {
      const target = sectionRefs.current[item.id]
      if (target) observer.observe(target)
    })

    return () => observer.disconnect()
  }, [allDetailItems, itemToGroupKey, mode])

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current)
      }
    }
  }, [])

  const handleSelectItem = (id: string, groupKey: SidebarGroupKey) => {
    activeLockRef.current = true
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current)
    }

    setActiveItem(id)
    setCollapsed((prev) => ({ ...prev, [groupKey]: false }))
    const target = sectionRefs.current[id]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // 클릭 이동 중에는 observer active 업데이트를 잠시 중지한다.
    lockTimerRef.current = window.setTimeout(() => {
      activeLockRef.current = false
      lockTimerRef.current = null
    }, 700)
  }

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
          <DetailAccordionSidebar
            groups={detailMenus}
            collapsedByGroup={collapsed}
            activeItemId={activeItem}
            onToggleGroup={toggleGroup}
            onSelectItem={handleSelectItem}
          />

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
            <section className={styles.detailSections}>
              {allDetailItems.map((item) => (
                <article
                  key={item.id}
                  id={item.id}
                  ref={(element) => {
                    sectionRefs.current[item.id] = element
                  }}
                  className={styles.detailSectionCard}
                >
                  <p className={styles.detailSectionGroup}>{item.groupTitle}</p>
                  <h3>{item.label}</h3>
                  <p>
                    {item.label} 섹션 더미 데이터입니다. 실서비스 연동 시 이 영역에 차트/테이블/관련 뉴스/연관
                    인물 컴포넌트를 연결하면 됩니다.
                  </p>
                  <ul>
                    <li>테스트 포인트 A · 스크롤 진입 시 사이드바 자동 선택</li>
                    <li>테스트 포인트 B · 메뉴 클릭 시 해당 섹션으로 이동</li>
                    <li>테스트 포인트 C · 섹션별 API/카드 조합 가능</li>
                  </ul>
                </article>
              ))}
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
