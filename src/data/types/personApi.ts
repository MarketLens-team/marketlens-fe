/** OpenAPI `PersonStatementResponse` */
export interface PersonStatementDto {
  statementId: number
  personId?: number
  personName: string
  personRole: string
  organizationName?: string
  statementSummary: string
  sourceName?: string
  publishedAt: string
  sentiment: string
  score?: number
  relatedStocks?: { stockCode: string; stockName?: string; relevance?: string }[]
}
