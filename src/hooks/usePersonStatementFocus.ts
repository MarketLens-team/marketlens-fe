import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

interface MentionWithId {
  id: string
}

/** 검색 `?statementId=` — 해당 발언 스크롤·초록 강조, 바깥 클릭 시 쿼리 해제 */
export function usePersonStatementFocus(
  mentions: MentionWithId[],
  options?: { loading?: boolean },
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusStatementId = searchParams.get('statementId')?.trim() || null
  const loading = options?.loading ?? false

  const clearFocusStatement = useCallback(() => {
    if (!searchParams.has('statementId')) return
    const next = new URLSearchParams(searchParams)
    next.delete('statementId')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!focusStatementId || loading) return
    const hasTarget = mentions.some((item) => item.id === focusStatementId)
    if (!hasTarget) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`person-statement-${focusStatementId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusStatementId, mentions, loading])

  useEffect(() => {
    if (!focusStatementId) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const focusedEl = document.getElementById(`person-statement-${focusStatementId}`)
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
