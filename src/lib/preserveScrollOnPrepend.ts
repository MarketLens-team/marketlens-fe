import { ANCHORED_FEED_LIST_SELECTOR } from './anchoredFeedMeasure'

const ANCHOR_ITEM_SELECTOR = '[data-scroll-anchor-item]'

export interface ScrollListHeightSnapshot {
  kind: 'list-height'
  listScrollHeight: number
  scrollTop: number
}

export interface ScrollMetricsSnapshot {
  kind: 'metrics'
  scrollHeight: number
  scrollTop: number
}

export interface ScrollAnchorSnapshot {
  kind: 'anchor'
  element: HTMLElement
  /** React 재마운트 시 `getElementById` 폴백 */
  anchorElementId?: string
  offsetFromRootTop: number
}

export type PrependScrollSnapshot =
  | ScrollListHeightSnapshot
  | ScrollAnchorSnapshot
  | ScrollMetricsSnapshot

function resolveAnchoredFeedList(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(ANCHORED_FEED_LIST_SELECTOR)
}

function resolvePrependAnchorScope(root: HTMLElement): ParentNode {
  return resolveAnchoredFeedList(root) ?? root
}

/** prepend 직전 — anchored 피드 목록 높이·스크롤 기준 (sticky·차트 영역 흔들림 최소화) */
export function capturePrependScrollSnapshot(root: HTMLElement): PrependScrollSnapshot {
  const list = resolveAnchoredFeedList(root)
  if (list) {
    return {
      kind: 'list-height',
      listScrollHeight: list.scrollHeight,
      scrollTop: root.scrollTop,
    }
  }

  const rootRect = root.getBoundingClientRect()
  const scope = resolvePrependAnchorScope(root)
  const candidates = scope.querySelectorAll<HTMLElement>(ANCHOR_ITEM_SELECTOR)

  for (const element of candidates) {
    const rect = element.getBoundingClientRect()
    if (rect.bottom <= rootRect.top + 2) continue
    if (rect.top >= rootRect.bottom - 2) continue
    return {
      kind: 'anchor',
      element,
      anchorElementId: element.id || undefined,
      offsetFromRootTop: rect.top - rootRect.top,
    }
  }

  if (candidates.length > 0) {
    const element = candidates[0]
    const rect = element.getBoundingClientRect()
    return {
      kind: 'anchor',
      element,
      anchorElementId: element.id || undefined,
      offsetFromRootTop: rect.top - rootRect.top,
    }
  }

  return {
    kind: 'metrics',
    scrollHeight: root.scrollHeight,
    scrollTop: root.scrollTop,
  }
}

function restoreListHeightSnapshot(
  root: HTMLElement,
  snapshot: ScrollListHeightSnapshot,
  /** API 대기 중 스크롤이 움직였으면 현재 위치 기준으로 높이 차이만 보정 */
  scrollBase: 'captured' | 'current' = 'captured',
) {
  const list = resolveAnchoredFeedList(root)
  if (!list) return
  const delta = list.scrollHeight - snapshot.listScrollHeight
  if (delta === 0) return
  const baseTop = scrollBase === 'current' ? root.scrollTop : snapshot.scrollTop
  root.scrollTop = baseTop + delta
}

function listHeightSnapshotAfterRestore(
  root: HTMLElement,
  snapshot: ScrollListHeightSnapshot,
): ScrollListHeightSnapshot {
  const list = resolveAnchoredFeedList(root)
  return {
    kind: 'list-height',
    listScrollHeight: list?.scrollHeight ?? snapshot.listScrollHeight,
    scrollTop: root.scrollTop,
  }
}

function restoreMetricsSnapshot(root: HTMLElement, snapshot: ScrollMetricsSnapshot) {
  const delta = root.scrollHeight - snapshot.scrollHeight
  if (delta > 0) {
    root.scrollTop = snapshot.scrollTop + delta
  }
}

function resolveAnchorElement(snapshot: ScrollAnchorSnapshot): HTMLElement | null {
  if (snapshot.anchorElementId) {
    const byId = document.getElementById(snapshot.anchorElementId)
    if (byId instanceof HTMLElement) return byId
  }
  return document.contains(snapshot.element) ? snapshot.element : null
}

function restoreAnchorSnapshot(root: HTMLElement, snapshot: ScrollAnchorSnapshot) {
  const element = resolveAnchorElement(snapshot)
  if (!element) return
  const rootRect = root.getBoundingClientRect()
  const rect = element.getBoundingClientRect()
  const offsetNow = rect.top - rootRect.top
  const delta = offsetNow - snapshot.offsetFromRootTop
  if (Math.abs(delta) > 0.5) {
    root.scrollTop += delta
  }
}

export function restorePrependScrollSnapshot(
  root: HTMLElement,
  snapshot: PrependScrollSnapshot,
  options?: { scrollBase?: 'captured' | 'current' },
) {
  if (snapshot.kind === 'list-height') {
    restoreListHeightSnapshot(root, snapshot, options?.scrollBase ?? 'captured')
    return
  }
  if (snapshot.kind === 'anchor') {
    restoreAnchorSnapshot(root, snapshot)
    return
  }
  restoreMetricsSnapshot(root, snapshot)
}

let pendingPrependRestoreRaf = 0
let pendingIdleRestoreCancel: (() => void) | null = null

/** API 대기 중 사용자가 많이 스크롤했으면 보정 생략 (스크롤과 싸우지 않음) */
const PREPEND_RESTORE_DRIFT_SKIP_PX = 72
const PREPEND_RESTORE_SCROLL_IDLE_MS = 100
const PREPEND_RESTORE_MAX_WAIT_MS = 480

function snapshotScrollTop(snapshot: PrependScrollSnapshot): number | null {
  if (snapshot.kind === 'list-height' || snapshot.kind === 'metrics') {
    return snapshot.scrollTop
  }
  return null
}

/** 레이아웃·이미지 한 프레임 후 1회만 보정 (빠른 연속 prepend 시 이전 보정 취소) */
export function schedulePrependScrollRestore(root: HTMLElement, snapshot: PrependScrollSnapshot) {
  if (pendingPrependRestoreRaf) {
    cancelAnimationFrame(pendingPrependRestoreRaf)
  }
  pendingPrependRestoreRaf = requestAnimationFrame(() => {
    pendingPrependRestoreRaf = 0
    restorePrependScrollSnapshot(root, snapshot)
  })
}

/**
 * prepend 직후 — 스크롤이 잠깐 멈춘 뒤 보정.
 * 응답 전에 빠르게 올린 경우 drift가 크면 보정을 건너뜀.
 */
export function restorePrependScrollWhenIdle(root: HTMLElement, snapshot: PrependScrollSnapshot) {
  if (pendingIdleRestoreCancel) {
    pendingIdleRestoreCancel()
    pendingIdleRestoreCancel = null
  }

  const capturedScrollTop = snapshotScrollTop(snapshot)
  const startedAt = Date.now()
  let lastScrollAt = Date.now()

  const onScroll = () => {
    lastScrollAt = Date.now()
  }
  root.addEventListener('scroll', onScroll, { passive: true })

  let cancelled = false

  const stopListening = () => {
    if (cancelled) return
    cancelled = true
    root.removeEventListener('scroll', onScroll)
    pendingIdleRestoreCancel = null
  }

  const finish = () => {
    stopListening()
    const drifted =
      capturedScrollTop != null &&
      Math.abs(root.scrollTop - capturedScrollTop) > PREPEND_RESTORE_DRIFT_SKIP_PX

    if (snapshot.kind === 'list-height') {
      restoreListHeightSnapshot(root, snapshot, drifted ? 'current' : 'captured')
      schedulePrependScrollRestore(root, listHeightSnapshotAfterRestore(root, snapshot))
      return
    }

    if (drifted) {
      if (snapshot.kind === 'metrics') {
        const delta = root.scrollHeight - snapshot.scrollHeight
        if (delta > 0) {
          root.scrollTop += delta
        }
      }
      return
    }

    restorePrependScrollSnapshot(root, snapshot)
    schedulePrependScrollRestore(root, snapshot)
  }

  pendingIdleRestoreCancel = stopListening

  const tick = () => {
    if (cancelled) return
    const now = Date.now()
    const idle = now - lastScrollAt >= PREPEND_RESTORE_SCROLL_IDLE_MS
    const timedOut = now - startedAt >= PREPEND_RESTORE_MAX_WAIT_MS
    if (idle || timedOut) {
      finish()
      return
    }
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}
