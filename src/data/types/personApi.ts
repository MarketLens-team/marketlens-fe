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
  imageUrl?: string
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
  imageUrl?: string
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
  nextCursor?: string | null
  hasNext?: boolean
}

/** OpenAPI `PersonSidebarResponse` — `GET /api/v1/persons/sidebar` */
export interface PersonSidebarResponse {
  topPersons: PersonTopResponse[]
  frequentStocks: FrequentStockItemResponse[]
}
