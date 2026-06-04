import { useCallback, useRef, useState } from 'react'
import { fetchStockSummary } from '../../data/clients/stockClient'
import type { DashboardHeadlineTone } from './pickDashboardAlerts'

export type AnomalySummaryStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface OpenAnomalySummary {
  code: string
  name: string
  imageUrl?: string | null
  signalLabel: string
  headline: string
  headlineTone: DashboardHeadlineTone
}

const HOVER_OPEN_MS = 1500
const HOVER_CLOSE_MS = 400
/** 모달 호버 영역 이탈 후 유지 시간 */
const MODAL_LEAVE_MS = 700
/** 모달 표시 직후 — 호버 이탈로 닫히지 않는 최소 시간 */
const MODAL_GRACE_MS = 3000

export function useDashboardAnomalySummary() {
  const cacheRef = useRef<Map<string, string | null>>(new Map())
  /** 호버 전환 시 늦게 도착한 summary 응답이 다른 종목 헤더를 덮지 않도록 */
  const activeCodeRef = useRef<string | null>(null)
  const openedAtRef = useRef<number | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [target, setTarget] = useState<OpenAnomalySummary | null>(null)
  const [status, setStatus] = useState<AnomalySummaryStatus>('idle')
  const [summaryText, setSummaryText] = useState<string | null>(null)

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    openTimerRef.current = null
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const markOpened = useCallback(() => {
    openedAtRef.current = Date.now()
  }, [])

  const close = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    activeCodeRef.current = null
    openedAtRef.current = null
    setTarget(null)
    setStatus('idle')
    setSummaryText(null)
  }, [clearCloseTimer, clearOpenTimer])

  const isActiveCode = (code: string) => activeCodeRef.current === code

  const runCloseAfterGrace = useCallback(() => {
    const openedAt = openedAtRef.current
    if (openedAt == null) {
      close()
      return
    }
    const graceLeft = MODAL_GRACE_MS - (Date.now() - openedAt)
    if (graceLeft > 0) {
      closeTimerRef.current = setTimeout(() => close(), graceLeft)
      return
    }
    close()
  }, [close])

  const openSummary = useCallback(
    async (target: OpenAnomalySummary) => {
      const code = target.code
      activeCodeRef.current = code
      setTarget(target)
      markOpened()

      if (cacheRef.current.has(code)) {
        const cached = cacheRef.current.get(code) ?? null
        if (!isActiveCode(code)) return
        setSummaryText(cached)
        setStatus(cached ? 'ready' : 'empty')
        return
      }

      setStatus('loading')
      setSummaryText(null)
      try {
        const response = await fetchStockSummary(code)
        if (!isActiveCode(code)) return
        const text = response.aiSummary?.trim() || null
        cacheRef.current.set(code, text)
        setSummaryText(text)
        setStatus(text ? 'ready' : 'empty')
      } catch {
        if (!isActiveCode(code)) return
        setStatus('error')
      }
    },
    [markOpened],
  )

  const scheduleOpen = useCallback(
    (target: OpenAnomalySummary) => {
      clearCloseTimer()
      clearOpenTimer()
      openTimerRef.current = setTimeout(() => {
        void openSummary(target)
      }, HOVER_OPEN_MS)
    },
    [clearCloseTimer, clearOpenTimer, openSummary],
  )

  const scheduleClose = useCallback(
    (delayMs: number = HOVER_CLOSE_MS) => {
      clearOpenTimer()
      clearCloseTimer()
      closeTimerRef.current = setTimeout(() => runCloseAfterGrace(), delayMs)
    },
    [clearCloseTimer, clearOpenTimer, runCloseAfterGrace],
  )

  const scheduleModalLeave = useCallback(() => {
    scheduleClose(MODAL_LEAVE_MS)
  }, [scheduleClose])

  const cancelClose = useCallback(() => {
    clearCloseTimer()
  }, [clearCloseTimer])

  return {
    target,
    status,
    summaryText,
    isOpen: target !== null,
    openSummary,
    close,
    scheduleOpen,
    scheduleClose,
    scheduleModalLeave,
    cancelClose,
  }
}
