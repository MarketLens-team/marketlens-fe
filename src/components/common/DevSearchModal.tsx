import { useRef } from 'react'
import { Modal } from '../ui/Modal'
import styles from './DevSearchModal.module.css'

const NEWS_ITEMS = [
  { title: "젠슨황 '삼성전자·하이닉스 최첨단 메모리 샘플 받아, 블랙웰 수요 강력'", meta: '11월 8일 조선일보' },
  { title: '가격 싼데 고장도 잘 안 나, 레트로 감성 가전 찾는 소비자들', meta: '11월 7일 매일경제' },
  { title: '[마켓PRO] 고수들, AI 버블론 재점화에도 삼성전자 매수', meta: '11월 7일 한국경제' },
  { title: '외국인 순매수 전환, 반도체 대형주 중심으로 수급 개선', meta: '11월 6일 연합뉴스' },
  { title: '증권가 "메모리 업황 회복 국면, 내년 실적 상향 가능성"', meta: '11월 6일 서울경제' },
  { title: '삼성전자, 차세대 파운드리 로드맵 공개…파트너사 협력 확대', meta: '11월 5일 전자신문' },
  { title: 'HBM 수요 둔화 우려에도 장기 계약 비중 늘려 공급 안정화', meta: '11월 5일 머니투데이' },
  { title: '기관 "반도체 밸류에이션 재평가 구간…선별 매수 유효"', meta: '11월 4일 이데일리' },
  { title: '삼성전자 주주환원 정책, 배당·자사주 매입 시나리오는', meta: '11월 4일 한국경제' },
  { title: '스마트폰 출하 회복세…갤럭시 라인업 판매 호조', meta: '11월 3일 연합뉴스' },
  { title: 'DS부문 적자 폭 축소…분기 실적 개선 기대', meta: '11월 3일 매일경제' },
  { title: '미·중 무역 긴장 속 공급망 다변화, 국내 반도체 수혜론', meta: '11월 2일 조선비즈' },
  { title: '엑시노스·GPU 내재화 가속…파트너 생태계 재편', meta: '11월 2일 디지털타임스' },
  { title: '유럽 전장 수요 증가…차량용 반도체 물량 확대', meta: '11월 1일 서울경제' },
  { title: 'ESG 투자 확대…탄소 저감·재생에너지 투자 공시', meta: '11월 1일 한겨레' },
  { title: '파운드리 경쟁 심화…TSMC·인텔과 기술 격차는', meta: '10월 31일 전자신문' },
  { title: '원·달러 환율 변동성…수출 기업 실적 민감도 분석', meta: '10월 31일 머니S' },
  { title: '연말 배당주 관심…대형주 배당 매력 재조명', meta: '10월 30일 이데일리' },
  { title: '코스피 지수 연동 ETF 자금 유입…반도체 비중 확대', meta: '10월 30일 한국경제' },
  { title: '애널리스트 컨센서스 상향…목표주가 조정 잇따라', meta: '10월 29일 연합뉴스' },
] as const

interface DevSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DevSearchModal({ isOpen, onClose }: DevSearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnEsc
      closeOnOverlay
      contentClassName={styles.dialogContent}
      bodyClassName={styles.dialogBody}
      initialFocusRef={inputRef}
    >
      <section aria-label="검색 모달">
        <div className={styles.inputRow}>
          <input ref={inputRef} className={styles.input} defaultValue="삼성전자" placeholder="종목명 또는 종목코드로 검색하세요..." />
          <span className={styles.inputIcon} aria-hidden>
            ⌕
          </span>
        </div>

        <div className={styles.sectionLabel}>종목</div>
        <article className={styles.stockCard}>
          <div className={styles.stockLeft}>
            <div className={styles.stockAvatar}>S</div>
            <div>
              <p className={styles.stockName}>삼성전자</p>
              <p className={styles.stockCode}>005930</p>
            </div>
          </div>
          <div className={styles.stockRight}>
            <div className={styles.stockPrice}>76,966</div>
            <div className={styles.stockDelta}>7.57%</div>
          </div>
        </article>

        <div className={styles.sectionLabel}>뉴스</div>
        <ul className={styles.newsList}>
          {NEWS_ITEMS.map((item) => (
            <li key={item.title} className={styles.newsItem}>
              <div className={styles.newsText}>
                <p className={styles.newsTitle}>{item.title}</p>
                <p className={styles.newsMeta}>{item.meta}</p>
              </div>
              <div className={styles.newsThumb} aria-hidden />
            </li>
          ))}
        </ul>

        <div className={styles.footerHints}>
          <span>↩ 종목으로 이동하기</span>
          <span>ESC 모달 닫기</span>
          <span>↑↓ 탐색하기</span>
        </div>
      </section>
    </Modal>
  )
}
