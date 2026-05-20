/** OpenAPI `StockTag` — 일부 응답은 `code` 키만 올 수 있어 둘 다 허용 */
export interface PersonStockTagResponse {
  stockCode?: string
  code?: string
  stockName?: string
  relevance?: string
}

/** OpenAPI `PersonStatementResponse` */
export interface PersonStatementResponse {
  statementId: number
  personId: number
  personName: string
  personRole: string
  organizationName: string
  statementSummary: string
  sourceName: string
  publishedAt: string
  sentiment: string
  score: number
  relatedStocks: PersonStockTagResponse[]
}

/** OpenAPI `PersonTopResponse` */
export interface PersonTopResponse {
  personId: number
  personName: string
  personRole: string
  organizationName: string
  mentionCount: number
}

/** OpenAPI `FrequentStockItem` */
export interface FrequentStockItemResponse {
  stockCode?: string
  stockName?: string
  mentionCount?: number
}

/** OpenAPI `PersonMentionCursorResponse` — `GET /api/v1/persons/mentions/cursor` */
export interface PersonMentionCursorResponse {
  items: PersonStatementResponse[]
  topPersons?: PersonTopResponse[]
  frequentStocks?: FrequentStockItemResponse[]
  nextCursor?: string | null
  hasNext?: boolean
}
