import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import styles from './DevSortButtonPage.module.css'

type SortOrder = 'LATEST' | 'OLDEST'
type TabKey = 'LATEST' | 'OLDEST' | 'DATE'

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

/** 현재 스타일 — 개별 pill + border */
function CurrentStyle() {
  const [order, setOrder] = useState<SortOrder>('LATEST')
  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>Current — 개별 pill + border</p>
      <div className={styles.sortBar}>
        <button
          type="button"
          className={`${styles.cur_sortBtn} ${order === 'LATEST' ? styles.cur_active : ''}`}
          onClick={() => setOrder('LATEST')}
        >
          최신순
        </button>
        <button
          type="button"
          className={`${styles.cur_sortBtn} ${order === 'OLDEST' ? styles.cur_active : ''}`}
          onClick={() => setOrder('OLDEST')}
        >
          오래된순
        </button>
        <button type="button" className={styles.cur_calBtn}>
          <CalendarIcon />
          5.26.
        </button>
      </div>
    </div>
  )
}

/** A — 세그먼트 컨트롤 */
function SegmentedControl() {
  const [order, setOrder] = useState<SortOrder>('LATEST')
  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>A — 세그먼트 컨트롤</p>
      <div className={styles.sortBar}>
        <div className={styles.seg_control}>
          <button
            type="button"
            className={`${styles.seg_btn} ${order === 'LATEST' ? styles.seg_active : ''}`}
            onClick={() => setOrder('LATEST')}
          >
            최신순
          </button>
          <button
            type="button"
            className={`${styles.seg_btn} ${order === 'OLDEST' ? styles.seg_active : ''}`}
            onClick={() => setOrder('OLDEST')}
          >
            오래된순
          </button>
        </div>
        <button type="button" className={styles.seg_calBtn}>
          <CalendarIcon />
          5.26.
        </button>
      </div>
    </div>
  )
}

/** B — 언더라인 탭 */
function UnderlineTab() {
  const [order, setOrder] = useState<SortOrder>('LATEST')
  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>B — 언더라인 탭</p>
      <div className={styles.sortBar}>
        <div className={styles.tab_row}>
          <button
            type="button"
            className={`${styles.tab_btn} ${order === 'LATEST' ? styles.tab_active : ''}`}
            onClick={() => setOrder('LATEST')}
          >
            최신순
          </button>
          <button
            type="button"
            className={`${styles.tab_btn} ${order === 'OLDEST' ? styles.tab_active : ''}`}
            onClick={() => setOrder('OLDEST')}
          >
            오래된순
          </button>
        </div>
        <button type="button" className={styles.tab_calBtn}>
          <CalendarIcon />
          5.26.
        </button>
      </div>
    </div>
  )
}

/** C — 테두리 없는 배경 칩 */
function BackgroundChip() {
  const [order, setOrder] = useState<SortOrder>('LATEST')
  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>C — 테두리 없는 배경 칩</p>
      <div className={styles.sortBar}>
        <button
          type="button"
          className={`${styles.chip_btn} ${order === 'LATEST' ? styles.chip_active : ''}`}
          onClick={() => setOrder('LATEST')}
        >
          최신순
        </button>
        <button
          type="button"
          className={`${styles.chip_btn} ${order === 'OLDEST' ? styles.chip_active : ''}`}
          onClick={() => setOrder('OLDEST')}
        >
          오래된순
        </button>
        <button type="button" className={styles.chip_calBtn}>
          <CalendarIcon />
          5.26.
        </button>
      </div>
    </div>
  )
}

/** D — 흰색 강조 언더라인 탭 */
function WhiteUnderlineTab() {
  const [order, setOrder] = useState<SortOrder>('LATEST')

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>D — 흰색 강조 언더라인 탭</p>
      <div className={styles.wu_bar}>
        <div className={styles.wu_tabRow}>
          {(['LATEST', 'OLDEST'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.wu_tab} ${order === key ? styles.wu_tabActive : ''}`}
              onClick={() => setOrder(key)}
            >
              {key === 'LATEST' ? '최신순' : '오래된순'}
            </button>
          ))}
        </div>
        <button type="button" className={styles.wu_calBtn}>
          <CalendarIcon />
          5.26.
        </button>
      </div>
    </div>
  )
}

const SAMPLE_DATES = ['2026-05-24', '2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28']

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** 미니 달력 팝업 — 날짜 선택 or 닫기 */
function MiniCalPopup({ onSelect, onClose }: { onSelect: (d: string) => void; onClose: () => void }) {
  return (
    <div className={styles.miniCal}>
      <p className={styles.miniCalHint}>날짜 선택</p>
      <div className={styles.miniCalDates}>
        {SAMPLE_DATES.map((d) => (
          <button key={d} type="button" className={styles.miniCalDate} onClick={() => onSelect(d)}>{d}</button>
        ))}
      </div>
      <button type="button" className={styles.miniCalClose} onClick={onClose}>닫기</button>
    </div>
  )
}

/**
 * 달력 버튼 UX:
 *  - 기본: 버튼 클릭 → 달력 모달
 *  - 선택됨: [날짜 영역] 클릭 → 달력 다시 열림(변경) / [×] 클릭 → 초기화
 */
function CalendarButtonVariants() {
  const [date, setDate] = useState<string | null>(null)
  const [openFor, setOpenFor] = useState<number | null>(null)

  const openCal = (id: number) => setOpenFor(id)
  const closeCal = () => setOpenFor(null)
  const selectDate = (d: string) => { setDate(d); closeCal() }
  const clearDate = (e: React.MouseEvent) => { e.stopPropagation(); setDate(null); closeCal() }

  return (
    <div className={styles.variantWrap}>
      <div className={styles.calHeader}>
        <p className={styles.variantLabel}>달력 버튼 UX — 날짜 영역 클릭 → 달력 / × 클릭 → 초기화</p>
        {date && <span className={styles.calToggle}>선택됨: {date}</span>}
      </div>

      <div className={styles.calGrid}>

        {/* 1 — pill, 아이콘 → 날짜 펼침 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>1 — pill, 날짜 펼침</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv1} ${date ? styles.cv1_on : ''}`} onClick={() => openCal(1)}>
              <CalendarIcon />
              {date && <span>{date}</span>}
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 1 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 1-ring — pill + ring hover 효과 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>1-ring — pill + ring hover</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv1ring} ${date ? styles.cv1ring_on : ''}`} onClick={() => openCal(11)}>
              <CalendarIcon />
              {date && <span>{date}</span>}
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 11 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 2 — ghost */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>2 — ghost, border 없음</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv2} ${date ? styles.cv2_on : ''}`} onClick={() => openCal(2)}>
              <CalendarIcon />
              <span>{date ?? '날짜'}</span>
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 2 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 3 — outlined radius-sm */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>3 — outlined, radius-sm</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv3} ${date ? styles.cv3_on : ''}`} onClick={() => openCal(3)}>
              <CalendarIcon />
              <span>{date ?? '날짜 필터'}</span>
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 3 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 4 — split 구분선 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>4 — split 구분선</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv4} ${date ? styles.cv4_on : ''}`} onClick={() => openCal(4)}>
              <span className={styles.cv4_icon}><CalendarIcon /></span>
              <span className={styles.cv4_divider} aria-hidden />
              <span className={styles.cv4_text}>{date ?? '날짜'}</span>
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 4 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 5 — filled chip */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>5 — filled chip, border 없음</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv5} ${date ? styles.cv5_on : ''}`} onClick={() => openCal(5)}>
              <CalendarIcon />
              <span>{date ?? '날짜'}</span>
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 5 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 6 — 원형 아이콘 + 날짜 따로 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>6 — 원형 아이콘 + 날짜 따로</span>
          <div className={styles.calBtnWrap}>
            <div className={styles.cv6_wrap}>
              <button type="button" className={`${styles.cv6_icon} ${date ? styles.cv6_on : ''}`} onClick={() => openCal(6)} aria-label="날짜 선택">
                <CalendarIcon />
              </button>
              {date && (
                <button type="button" className={styles.cv6_date} onClick={() => openCal(6)}>
                  {date}
                  <span className={styles.cvX} onClick={clearDate}><XIcon /></span>
                </button>
              )}
            </div>
            {openFor === 6 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 7 — 텍스트 링크 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>7 — 텍스트 링크</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv7} ${date ? styles.cv7_on : ''}`} onClick={() => openCal(7)}>
              <CalendarIcon />
              <span>{date ?? '날짜별 보기'}</span>
              {date && <span className={styles.cvX} onClick={clearDate}><XIcon /></span>}
            </button>
            {openFor === 7 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

        {/* 8 — 날짜 강조 */}
        <div className={styles.calRow}>
          <span className={styles.calRowLabel}>8 — 날짜 강조</span>
          <div className={styles.calBtnWrap}>
            <button type="button" className={`${styles.cv8} ${date ? styles.cv8_on : ''}`} onClick={() => openCal(8)}>
              {date
                ? <><span className={styles.cv8_date}>{date}</span><span className={styles.cvX} onClick={clearDate}><XIcon /></span></>
                : <><CalendarIcon /><span className={styles.cv8_label}>날짜</span></>
              }
            </button>
            {openFor === 8 && <MiniCalPopup onSelect={selectDate} onClose={closeCal} />}
          </div>
        </div>

      </div>
    </div>
  )
}

/** E — 3탭 언더라인: 최신순 | 오래된순 | 날짜로 찾기 → 날짜 선택 시 날짜 표시 */
function ThreeTabUnderline() {
  const [activeTab, setActiveTab] = useState<TabKey>('LATEST')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calOpen, setCalOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<TabKey, HTMLButtonElement>>(new Map())
  const [hoverKey, setHoverKey] = useState<TabKey | null>(null)
  const [hoverStyle, setHoverStyle] = useState<{ left: number; width: number } | null>(null)

  const measureBtn = useCallback((key: TabKey) => {
    const nav = navRef.current
    const btn = btnRefs.current.get(key)
    if (!nav || !btn) return null
    const navRect = nav.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    return { left: btnRect.left - navRect.left, width: btnRect.width }
  }, [])

  useLayoutEffect(() => {
    if (hoverKey && hoverKey !== activeTab) {
      const pos = measureBtn(hoverKey)
      if (pos) setHoverStyle(pos)
    } else {
      setHoverStyle(null)
    }
  }, [hoverKey, activeTab, measureBtn])

  const handleTabClick = (key: TabKey) => {
    if (key === 'DATE') {
      // 이미 날짜 선택된 상태면 해제, 아니면 달력 열기
      if (activeTab === 'DATE' && selectedDate) {
        setSelectedDate(null)
        setActiveTab('LATEST')
      } else {
        setCalOpen(true)
      }
    } else {
      setActiveTab(key)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setActiveTab('DATE')
    setCalOpen(false)
  }

  const tabs: { key: TabKey; label: React.ReactNode }[] = [
    { key: 'LATEST', label: '최신순' },
    { key: 'OLDEST', label: '오래된순' },
    {
      key: 'DATE',
      label: activeTab === 'DATE' && selectedDate
        ? <span className={styles.e_dateLabel}><CalendarIcon />{selectedDate}</span>
        : <span className={styles.e_dateLabel}><CalendarIcon />날짜로 찾기</span>,
    },
  ]

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>E — 3탭: 최신순 | 오래된순 | 날짜로 찾기</p>

      <div
        ref={navRef}
        className={styles.e_nav}
        onMouseLeave={() => { setHoverKey(null); setHoverStyle(null) }}
      >
        {/* hover indicator */}
        <span
          className={styles.e_hoverIndicator}
          style={hoverStyle
            ? { transform: `translateX(${hoverStyle.left}px)`, width: hoverStyle.width, opacity: 1 }
            : { opacity: 0, width: 0 }}
          aria-hidden
        />
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            ref={(el) => { if (el) btnRefs.current.set(key, el); else btnRefs.current.delete(key) }}
            type="button"
            className={`${styles.e_tab} ${activeTab === key ? styles.e_tabActive : ''}`}
            onClick={() => handleTabClick(key)}
            onMouseEnter={() => setHoverKey(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 심플 달력 모의 팝업 */}
      {calOpen && (
        <div className={styles.e_calPopup}>
          <p className={styles.e_calHint}>날짜 선택 (예시)</p>
          <div className={styles.e_calDates}>
            {['2026-05-26', '2026-05-27', '2026-05-28'].map((d) => (
              <button
                key={d}
                type="button"
                className={styles.e_calDateBtn}
                onClick={() => handleDateSelect(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <button type="button" className={styles.e_calClose} onClick={() => setCalOpen(false)}>닫기</button>
        </div>
      )}

      <p className={styles.e_status}>
        {activeTab === 'DATE' && selectedDate
          ? `날짜 필터: ${selectedDate} — DATE 탭 다시 클릭하면 해제`
          : activeTab === 'LATEST' ? '최신순 정렬' : '오래된순 정렬'}
      </p>
    </div>
  )
}

export default function DevSortButtonPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>정렬 버튼 스타일 비교</h1>
      <p className={styles.desc}>버튼 클릭해서 active 상태도 확인</p>
      <div className={styles.grid}>
        <CurrentStyle />
        <SegmentedControl />
        <UnderlineTab />
        <BackgroundChip />
        <WhiteUnderlineTab />
        <ThreeTabUnderline />
        <CalendarButtonVariants />
      </div>
    </div>
  )
}
