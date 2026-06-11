import { useCallback, useRef, useState } from 'react'
import { fetchStockSummary } from '../../data/clients/stockClient'
import type { DashboardHeadlineTone } from './pickDashboardAlerts'

export type AnomalySummaryStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type AnomalySummarySource = 'alert' | 'watchlist' | 'buzz'

export interface AnomalySummaryHighlight {
  code: string
  source: AnomalySummarySource
}

export interface OpenAnomalySummary {
  code: string
  name: string
  imageUrl?: string | null
  signalLabel: string
  headline: string
  headlineTone: DashboardHeadlineTone
}

const HOVER_REVEAL_MS = 400
/** 패널·FAB 영역 이탈 후 닫기까지 유지 시간 */
const DOCK_LEAVE_MS = 700

export function useDashboardAnomalySummary() {
  const cacheRef = useRef<Map<string, string | null>>(new Map())
  /** fetch 응답이 다른 종목 헤더를 덮지 않도록 */
  const activeCodeRef = useRef<string | null>(null)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [lastTarget, setLastTarget] = useState<OpenAnomalySummary | null>(null)
  const [target, setTarget] = useState<OpenAnomalySummary | null>(null)
  const [status, setStatus] = useState<AnomalySummaryStatus>('idle')
  const [summaryText, setSummaryText] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<AnomalySummaryHighlight | null>(null)
  const [panelExpanded, setPanelExpanded] = useState(false)

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    revealTimerRef.current = null
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const dismissDock = useCallback(() => {
    clearCloseTimer()
    clearRevealTimer()
    activeCodeRef.current = null
    setTarget(null)
    setStatus('idle')
    setSummaryText(null)
    setPanelExpanded(false)
    setLastTarget(null)
    setHighlight(null)
  }, [clearCloseTimer, clearRevealTimer])

  const isActiveCode = (code: string) => activeCodeRef.current === code

  const openSummary = useCallback(async (next: OpenAnomalySummary) => {
    const code = next.code
    activeCodeRef.current = code
    setTarget(next)
    setPanelExpanded(true)

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
  }, [])

  const activateDock = useCallback(
    (next: OpenAnomalySummary) => {
      setLastTarget(next)
      void openSummary(next)
    },
    [openSummary],
  )

  const scheduleOpen = useCallback(
    (next: OpenAnomalySummary, source: AnomalySummarySource) => {
      clearCloseTimer()
      clearRevealTimer()
      setHighlight({ code: next.code, source })
      revealTimerRef.current = setTimeout(() => {
        activateDock(next)
      }, HOVER_REVEAL_MS)
    },
    [activateDock, clearCloseTimer, clearRevealTimer],
  )

  const scheduleClose = useCallback(() => {
    clearRevealTimer()
    setHighlight(null)
  }, [clearRevealTimer])

  const isHighlighted = useCallback(
    (source: AnomalySummarySource, code: string) =>
      highlight?.source === source && highlight.code === code,
    [highlight],
  )

  const scheduleDockLeave = useCallback(() => {
    if (!panelExpanded) return
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      dismissDock()
    }, DOCK_LEAVE_MS)
  }, [clearCloseTimer, dismissDock, panelExpanded])

  const cancelDockLeave = useCallback(() => {
    clearCloseTimer()
  }, [clearCloseTimer])

  const isDockVisible = lastTarget !== null

  return {
    lastTarget,
    target,
    status,
    summaryText,
    highlight,
    isHighlighted,
    isDockVisible,
    panelExpanded,
    isPanelOpen: panelExpanded && target !== null,
    dismissDock,
    scheduleOpen,
    scheduleClose,
    scheduleDockLeave,
    cancelDockLeave,
  }
}

export type DashboardAnomalySummaryController = ReturnType<typeof useDashboardAnomalySummary>
