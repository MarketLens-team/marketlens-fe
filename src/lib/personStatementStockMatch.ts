import { normalizeStockCodeForMatch } from './normalizeStockCode'
import type { PersonStatementResponse } from '../data/types/personApi'

function mentionRelatesToStock(row: PersonStatementResponse, targetNormalized: string): boolean {
  const tags = row.relatedStocks ?? []
  if (tags.length === 0) return false
  return tags.some((stock) => {
    const raw = stock.stockCode ?? stock.code ?? ''
    return normalizeStockCodeForMatch(raw) === targetNormalized
  })
}

/** 발언이 해당 종목과 연관되는지 */
export function personStatementRelatesToStock(
  row: PersonStatementResponse,
  stockCode: string,
): boolean {
  return mentionRelatesToStock(row, normalizeStockCodeForMatch(stockCode))
}
