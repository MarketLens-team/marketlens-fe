import { Link } from 'react-router-dom'
import styles from './DevRefinedStylePage.module.css'

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18V6M10 18V10M16 18V8M20 18v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function DevRefinedStylePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>DEV · REFINED</p>
          <h1 className={styles.title}>세련된 UI 패턴 시안</h1>
          <p className={styles.lead}>
            글로우·블러 없이 여백·계층·CTA만 정리한 톤입니다. 빈 화면·섹션·카드·리스트에
            적용할 때 참고하세요.
          </p>
          <ul className={styles.principles}>
            <li className={styles.principle}>여백 넉넉히</li>
            <li className={styles.principle}>문구 짧게</li>
            <li className={styles.principle}>CTA 1개 강조</li>
            <li className={styles.principle}>색 최소화</li>
          </ul>
          <nav className={styles.nav} aria-label="시안 섹션">
            <a href="#cta">CTA</a>
            <a href="#empty">Empty</a>
            <a href="#section">Section</a>
            <a href="#card">Card</a>
            <a href="#list">List</a>
            <a href="#notice">Notice</a>
            <Link to="/dev/refined/mock">더미 대시보드</Link>
            <Link to="/dev/errors">에러 페이지 (풀스크린)</Link>
          </nav>
        </header>

        <section className={styles.block} id="cta">
          <h2 className={styles.blockTitle}>CTA 계층</h2>
          <p className={styles.blockDesc}>
            강한 액션 1개(흰 pill) → 보조(outline) → 이전/취소(텍스트 링크).
          </p>
          <div className={`${styles.surface} ${styles.surfaceTight}`}>
            <div className={styles.ctaStack}>
              <button type="button" className={styles.pillPrimary}>
                관심 종목 추가
              </button>
              <button type="button" className={styles.pillSecondary}>
                대시보드로 이동
              </button>
              <button type="button" className={styles.textLink}>
                나중에 하기
              </button>
            </div>
          </div>
        </section>

        <section className={styles.block} id="empty">
          <h2 className={styles.blockTitle}>Empty state</h2>
          <p className={styles.blockDesc}>
            패널·테이블 안 빈 목록. 아이콘은 작게, 제목·한 줄 설명·CTA만.
          </p>
          <div className={styles.surface}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <ChartIcon />
              </div>
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
          </div>
        </section>

        <section className={styles.block} id="section">
          <h2 className={styles.blockTitle}>Section header</h2>
          <p className={styles.blockDesc}>라벨(mono) + 제목 + 한 줄 부제. 액션은 ghost pill.</p>
          <div className={styles.surface}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionHeadText}>
                <p className={styles.sectionLabel}>WATCHLIST</p>
                <h3 className={styles.sectionTitle}>관심 종목</h3>
                <p className={styles.sectionSub}>실시간 감성 · 최근 24시간</p>
              </div>
              <button type="button" className={styles.ghostAction}>
                전체 보기
              </button>
            </div>
            <p className={styles.surfaceNote}>(아래에 카드·리스트 콘텐츠)</p>
          </div>
        </section>

        <section className={styles.block} id="card">
          <h2 className={styles.blockTitle}>Metric card</h2>
          <p className={styles.blockDesc}>숫자 강조, 캡션은 secondary. 내부 타일은 elevated.</p>
          <p className={styles.tokenHint}>card var(--color-bg-card) · tile var(--color-bg-elevated)</p>
          <div className={styles.surface}>
            <div className={styles.cardGrid}>
              <article className={styles.refinedCard}>
                <p className={styles.cardMeta}>PORTFOLIO SENTIMENT</p>
                <p className={styles.cardValue}>+12</p>
                <p className={styles.cardCaption}>오늘 평균 감성 점수</p>
              </article>
              <article className={styles.refinedCard}>
                <p className={styles.cardMeta}>ACTIVE STOCKS</p>
                <p className={styles.cardValue}>8</p>
                <p className={styles.cardCaption}>관심 종목 수</p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.block} id="list">
          <h2 className={styles.blockTitle}>List row</h2>
          <p className={styles.blockDesc}>
            행 간 구분선만. 값은 mono + semantic color. 박스 배경은 카드 surface.
          </p>
          <p className={styles.tokenHint}>surface → var(--color-bg-card)</p>
          <div className={styles.surface}>
            <ul className={styles.list}>
              <li className={styles.listRow}>
                <div className={styles.listMain}>
                  <p className={styles.listTitle}>삼성전자</p>
                  <p className={styles.listSub}>005930</p>
                </div>
                <span className={`${styles.listValue} ${styles.listValueUp}`}>+6</span>
              </li>
              <li className={styles.listRow}>
                <div className={styles.listMain}>
                  <p className={styles.listTitle}>SK하이닉스</p>
                  <p className={styles.listSub}>000660</p>
                </div>
                <span className={`${styles.listValue} ${styles.listValueDown}`}>-3</span>
              </li>
              <li className={styles.listRow}>
                <div className={styles.listMain}>
                  <p className={styles.listTitle}>NAVER</p>
                  <p className={styles.listSub}>035420</p>
                </div>
                <span className={styles.listValue}>0</span>
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.block} id="notice">
          <h2 className={styles.blockTitle}>Inline notice</h2>
          <p className={styles.blockDesc}>노란 박스 대신 얇은 보더 + 짧은 문구.</p>
          <div className={styles.surface}>
            <aside className={styles.notice}>
              <p className={styles.noticeText}>
                <span className={styles.noticeStrong}>데이터 갱신 중</span>
                잠시 후 다시 확인해 주세요. 실시간 점수는 약 1분마다 반영됩니다.
              </p>
            </aside>
          </div>
        </section>

        <footer className={styles.footer}>
          <Link to="/dev">← Dev 홈</Link>
        </footer>
      </div>
    </main>
  )
}
