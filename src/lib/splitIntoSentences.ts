/**
 * AI 요약·이슈 텍스트를 문장 단위로 나눈다.
 * 마침표·물음표·느낌표(한·영) 뒤 공백 또는 문자열 끝을 기준으로 분리한다.
 */
export function splitIntoSentences(text: string | null | undefined): string[] {
  if (text == null) return []
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const sentences = normalized
    .split(/(?<=[.!?。])(?:\s+|$)/)
    .map((part) => part.trim())
    .filter(Boolean)

  return sentences.length > 0 ? sentences : [normalized]
}
