import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLayoutScrollRoot } from './useInfiniteScroll'

interface MentionWithId {
  id: string
}

const SCROLL_RETRY_COUNT = 10
const SCROLL_RETRY_MS = 80

function personStatementElementId(statementId: string) {
  return `person-statement-${statementId}`
}

/** 피드 전용 스크롤 또는 Layout main 기준으로 발언 카드로 스크롤 */
function scrollPersonStatementIntoView(
  statementId: string,
  behavior: ScrollBehavior = 'instant',
): boolean {
  const el = document.getElementById(personStatementElementId(statementId))
  if (!el) return false

  const scrollRoot = getLayoutScrollRoot()
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const targetTop =
      scrollRoot.scrollTop +
      (elRect.top - rootRect.top) -
      Math.max(0, (scrollRoot.clientHeight - elRect.height) / 2)
    scrollRoot.scrollTo({ top: Math.max(0, targetTop), behavior })
    return true
  }

  el.scrollIntoView({ behavior, block: 'center' })
  return true
}

interface UsePersonStatementFocusOptions {
  /** 초기 피드·around 로딩 중이면 스크롤 보류 */
  loading?: boolean
}

/** 검색·트래커 `?statementId=` — 해당 발언까지 로드·스크롤·초록 강조 (클릭해도 쿼리 유지 → anchored 피드 유지) */
export function usePersonStatementFocus(
  mentions: MentionWithId[],
  options?: UsePersonStatementFocusOptions,
) {
  const [searchParams] = useSearchParams()
  const focusStatementId = searchParams.get('statementId')?.trim() || null
  const loading = options?.loading ?? false
  /** 포커스 대상으로 초기 스크롤 1회만 — 이후 무한 스크롤은 사용자 제어 */
  const didScrollToFocusRef = useRef<string | null>(null)
  const [focusScrollSettled, setFocusScrollSettled] = useState(() => !focusStatementId)

  const hasTarget = Boolean(
    focusStatementId &&
      mentions.some((item) => String(item.id) === String(focusStatementId)),
  )

  useEffect(() => {
    didScrollToFocusRef.current = null
    setFocusScrollSettled(!focusStatementId)
  }, [focusStatementId])

  useEffect(() => {
    if (!focusStatementId || loading || !hasTarget) return
    if (didScrollToFocusRef.current === focusStatementId) return

    let cancelled = false
    let timeoutId: number | undefined
    let rafId = 0

    const attemptScroll = (triesLeft: number) => {
      if (cancelled) return
      if (scrollPersonStatementIntoView(focusStatementId, 'instant')) {
        didScrollToFocusRef.current = focusStatementId
        setFocusScrollSettled(true)
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

  const isStatementFocused = useCallback(
    (statementId: string) =>
      focusStatementId != null && String(focusStatementId) === String(statementId),
    [focusStatementId],
  )

  return { focusStatementId, isStatementFocused, focusScrollSettled }
}
