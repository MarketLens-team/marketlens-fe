/** OpenAPI `StockTag` */
export interface PersonStockTagResponse {
  stockCode: string
  stockName: string
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
