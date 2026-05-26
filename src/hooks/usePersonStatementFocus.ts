import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

interface MentionWithId {
  id: string
}

const SCROLL_RETRY_COUNT = 10
const SCROLL_RETRY_MS = 80

function personStatementElementId(statementId: string) {
  return `person-statement-${statementId}`
}

/** Layout `.main[data-scroll-root]` 기준으로 발언 카드로 스크롤 */
function scrollPersonStatementIntoView(statementId: string): boolean {
  const el = document.getElementById(personStatementElementId(statementId))
  if (!el) return false

  const scrollRoot = document.querySelector<HTMLElement>('[data-scroll-root]')
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const targetTop =
      scrollRoot.scrollTop +
      (elRect.top - rootRect.top) -
      Math.max(0, (scrollRoot.clientHeight - elRect.height) / 2)
    scrollRoot.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
    return true
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return true
}

interface UsePersonStatementFocusOptions {
  /** 초기 피드·around 로딩 중이면 스크롤 보류 */
  loading?: boolean
}

/** 검색·트래커 `?statementId=` — 해당 발언까지 로드·스크롤·초록 강조, 바깥 클릭 시 쿼리 해제 */
export function usePersonStatementFocus(
  mentions: MentionWithId[],
  options?: UsePersonStatementFocusOptions,
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusStatementId = searchParams.get('statementId')?.trim() || null
  const loading = options?.loading ?? false
  /** 포커스 대상으로 초기 스크롤 1회만 — 이후 무한 스크롤은 사용자 제어 */
  const didScrollToFocusRef = useRef<string | null>(null)

  const clearFocusStatement = useCallback(() => {
    if (!searchParams.has('statementId')) return
    const next = new URLSearchParams(searchParams)
    next.delete('statementId')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const hasTarget = Boolean(
    focusStatementId && mentions.some((item) => item.id === focusStatementId),
  )

  useEffect(() => {
    didScrollToFocusRef.current = null
  }, [focusStatementId])

  useEffect(() => {
    if (!focusStatementId || loading || !hasTarget) return
    if (didScrollToFocusRef.current === focusStatementId) return

    let cancelled = false
    let timeoutId: number | undefined
    let rafId = 0

    const attemptScroll = (triesLeft: number) => {
      if (cancelled) return
      if (scrollPersonStatementIntoView(focusStatementId)) {
        didScrollToFocusRef.current = focusStatementId
        return
      }
      if (triesLeft > 0) {
        timeoutId = window.setTimeout(() => attemptScroll(triesLeft - 1), SCROLL_RETRY_MS)
      }
    }

    rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => attemptScroll(SCROLL_RETRY_COUNT))
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [focusStatementId, mentions, loading, hasTarget])

  useEffect(() => {
    if (!focusStatementId) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const focusedEl = document.getElementById(personStatementElementId(focusStatementId))
      if (focusedEl?.contains(target)) return
      clearFocusStatement()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [focusStatementId, clearFocusStatement])

  const isStatementFocused = useCallback(
    (statementId: string) => focusStatementId === statementId,
    [focusStatementId],
  )

  return { focusStatementId, clearFocusStatement, isStatementFocused }
}
