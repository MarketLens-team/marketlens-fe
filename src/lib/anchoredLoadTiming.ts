/** anchored 로드 간격·스피너 최소 시간 대기 */
export async function waitAnchoredLoadGap(lastFinishedAtMs: number, minIntervalMs: number): Promise<void> {
  const remain = minIntervalMs - (Date.now() - lastFinishedAtMs)
  if (remain <= 0) return
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, remain)
  })
}

export async function waitAnchoredLoadVisible(startedAtMs: number, minVisibleMs: number): Promise<void> {
  const remain = minVisibleMs - (Date.now() - startedAtMs)
  if (remain <= 0) return
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, remain)
  })
}
