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

/** prepend 직후 즉시 보정 + 다음 프레임 1회 재보정 */
export function applyPrependScrollRestore(root: HTMLElement, snapshot: PrependScrollSnapshot) {
  restorePrependScrollSnapshot(root, snapshot)
  if (snapshot.kind === 'list-height') {
    schedulePrependScrollRestore(root, listHeightSnapshotAfterRestore(root, snapshot))
    return
  }
  schedulePrependScrollRestore(root, snapshot)
}

export interface ScrollRootLock {
  release: () => void
  /** prepend 보정 후 잠금 기준 scrollTop 갱신 */
  setLockedTop: (top: number) => void
}

/** newer 로딩 UI 동안 사용자 스크롤·휠로 위치가 밀리지 않도록 고정 */
export function lockScrollRoot(root: HTMLElement): ScrollRootLock {
  let lockedTop = root.scrollTop

  const onScroll = () => {
    if (root.scrollTop !== lockedTop) {
      root.scrollTop = lockedTop
    }
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
  }

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
  }

  root.addEventListener('scroll', onScroll, { passive: true })
  root.addEventListener('wheel', onWheel, { passive: false })
  root.addEventListener('touchmove', onTouchMove, { passive: false })

  return {
    release: () => {
      root.removeEventListener('scroll', onScroll)
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchmove', onTouchMove)
    },
    setLockedTop: (top: number) => {
      lockedTop = top
    },
  }
}
