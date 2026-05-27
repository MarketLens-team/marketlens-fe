/** 사이드바·목록용 — 글자 수 제한, 단어/공백 경계에서 `…` */
export function truncateText(text: string, maxLen: number): string {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length <= maxLen) return trimmed

  const slice = trimmed.slice(0, maxLen)
  const breakAt = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('，'), slice.lastIndexOf(','))
  const cut = breakAt > maxLen * 0.55 ? slice.slice(0, breakAt) : slice
  return `${cut.trimEnd()}…`
}
