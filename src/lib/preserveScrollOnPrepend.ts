export interface ScrollMetricsSnapshot {
  kind: 'metrics'
  scrollHeight: number
  scrollTop: number
}

export interface ScrollAnchorSnapshot {
  kind: 'anchor'
  element: HTMLElement
  offsetFromRootTop: number
}

export type PrependScrollSnapshot = ScrollMetricsSnapshot | ScrollAnchorSnapshot

const ANCHOR_ITEM_SELECTOR = '[data-scroll-anchor-item]'

/** prepend 직전 — 뷰포트 안 첫 피드 항목 기준 (끊김 없는 스크롤) */
export function capturePrependScrollSnapshot(root: HTMLElement): PrependScrollSnapshot {
  const rootRect = root.getBoundingClientRect()
  const candidates = root.querySelectorAll<HTMLElement>(ANCHOR_ITEM_SELECTOR)

  for (const element of candidates) {
    const rect = element.getBoundingClientRect()
    if (rect.bottom <= rootRect.top + 2) continue
    if (rect.top >= rootRect.bottom - 2) continue
    return {
      kind: 'anchor',
      element,
      offsetFromRootTop: rect.top - rootRect.top,
    }
  }

  if (candidates.length > 0) {
    const element = candidates[0]
    const rect = element.getBoundingClientRect()
    return {
      kind: 'anchor',
      element,
      offsetFromRootTop: rect.top - rootRect.top,
    }
  }

  return {
    kind: 'metrics',
    scrollHeight: root.scrollHeight,
    scrollTop: root.scrollTop,
  }
}

function restoreMetricsSnapshot(root: HTMLElement, snapshot: ScrollMetricsSnapshot) {
  const delta = root.scrollHeight - snapshot.scrollHeight
  if (delta > 0) {
    root.scrollTop = snapshot.scrollTop + delta
  }
}

function restoreAnchorSnapshot(root: HTMLElement, snapshot: ScrollAnchorSnapshot) {
  if (!document.contains(snapshot.element)) return
  const rootRect = root.getBoundingClientRect()
  const rect = snapshot.element.getBoundingClientRect()
  const offsetNow = rect.top - rootRect.top
  const delta = offsetNow - snapshot.offsetFromRootTop
  if (Math.abs(delta) > 0.5) {
    root.scrollTop += delta
  }
}

export function restorePrependScrollSnapshot(root: HTMLElement, snapshot: PrependScrollSnapshot) {
  if (snapshot.kind === 'anchor') {
    restoreAnchorSnapshot(root, snapshot)
    return
  }
  restoreMetricsSnapshot(root, snapshot)
}

/** 레이아웃·페인트 후 여러 프레임 보정 (빠른 연속 prepend 대비) */
export function schedulePrependScrollRestore(root: HTMLElement, snapshot: PrependScrollSnapshot) {
  const run = () => restorePrependScrollSnapshot(root, snapshot)
  requestAnimationFrame(() => {
    run()
    requestAnimationFrame(() => {
      run()
      requestAnimationFrame(run)
    })
  })
}
