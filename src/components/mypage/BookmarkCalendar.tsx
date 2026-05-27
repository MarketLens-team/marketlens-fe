import { useState } from 'react'
import clsx from 'clsx'
import type { MyPageBookmarkDateSummary } from '../../data/types/myPage'
import styles from './BookmarkCalendar.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface BookmarkCalendarProps {
  summaries: MyPageBookmarkDateSummary[]
  onDateClick: (date: string) => void
}

interface TooltipState {
  date: string
  x: number
  y: number
}

export function BookmarkCalendar({ summaries, onDateClick }: BookmarkCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-based
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const summaryMap = new Map(summaries.map((s) => [s.date, s]))

  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 6행 맞추기
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, date: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const calRect = e.currentTarget.closest(`.${styles.calendar}`)?.getBoundingClientRect()
    if (!calRect) return
    setTooltip({
      date,
      x: rect.left - calRect.left + rect.width / 2,
      y: rect.top - calRect.top,
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  const tooltipSummary = tooltip ? summaryMap.get(tooltip.date) : null

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="이전 달">‹</button>
        <span className={styles.monthLabel}>
          {year}년 {month + 1}월
        </span>
        <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="다음 달">›</button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.weekday}>{d}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className={styles.empty} />
          const date = toYMD(year, month, day)
          const summary = summaryMap.get(date)
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

          return (
            <button
              key={date}
              type="button"
              className={clsx(
                styles.day,
                isToday && styles.dayToday,
                summary && styles.dayHasBookmark,
              )}
              onClick={() => summary && onDateClick(date)}
              onMouseEnter={summary ? (e) => handleMouseEnter(e, date) : undefined}
              onMouseLeave={summary ? handleMouseLeave : undefined}
              aria-label={summary ? `${month + 1}월 ${day}일 · ${summary.count}건` : `${month + 1}월 ${day}일`}
              disabled={!summary}
            >
              <span className={styles.dayNum}>{day}</span>
              {summary && <span className={styles.dot} aria-hidden />}
            </button>
          )
        })}
      </div>

      {tooltip && tooltipSummary && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden
        >
          <p className={styles.tooltipHeader}>{tooltipSummary.count}건 저장</p>
          <ul className={styles.tooltipList}>
            {tooltipSummary.contexts.map((ctx, i) => (
              <li key={i} className={styles.tooltipItem}>
                {ctx.contextType === 'STOCK' && ctx.stockImageUrl ? (
                  <img className={styles.tooltipStockImg} src={ctx.stockImageUrl} alt="" />
                ) : ctx.contextType === 'STOCK' ? (
                  <span className={styles.tooltipStockImgPlaceholder} aria-hidden />
                ) : null}
                <span className={styles.tooltipCtxName}>
                  {ctx.contextType === 'ALL_NEWS' ? '전체 뉴스' : (ctx.stockName ?? ctx.stockCode ?? '종목')}
                </span>
                <span className={styles.tooltipCount}>{ctx.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
