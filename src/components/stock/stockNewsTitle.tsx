import type { ReactNode } from 'react'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 제목 내 키워드 강조 (CMC 코인명 하이라이트) */
export function renderStockNewsTitle(title: string, highlightTerms?: string[]): ReactNode {
  const terms = highlightTerms?.filter(Boolean) ?? []
  if (terms.length === 0) return title

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  const parts = title.split(pattern)

  return parts.map((part, index) => {
    const matched = terms.some((term) => part.toLowerCase() === term.toLowerCase())
    if (!matched) return part
    return <mark key={`${part}-${index}`}>{part}</mark>
  })
}
