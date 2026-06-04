/** OpenAPI Admin stocks */

export interface AdminStockResponse {
  stockId: number
  stockCode: string
  stockName: string
  market: string
  sectorName: string
  enabled: boolean
  deletedAt: string | null
  createdAt: string
}

export interface AdminStockCreateRequest {
  stockCode: string
  stockName: string
  market: 'KOSPI' | 'KOSDAQ'
  sectorId: number
}
