/** 스플래시·로딩이 너무 짧게 깜빡이지 않도록 최소 대기(ms) */
export const MIN_LOADING_MS = 500

export async function withMinDuration<T>(task: () => Promise<T>, minMs = MIN_LOADING_MS): Promise<T> {
  const started = Date.now()
  const result = await task()
  const remaining = minMs - (Date.now() - started)
  if (remaining > 0) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, remaining)
    })
  }
  return result
}
