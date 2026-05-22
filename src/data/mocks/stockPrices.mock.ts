import { TICKER_STOCK_CODES } from '../constants/tickerStockCodes'
import { mockStockDirectory } from './stockDirectory.mock'
import { mockStockDetails } from './stock.mock'
import type { StockPricesResponse } from '../types/stockApi'

export function buildMockStockPricesResponse(): StockPricesResponse {
  const directoryStocks = mockStockDirectory.sectors.flatMap((sector) => sector.stocks)
  const nameByCode = new Map(directoryStocks.map((stock) => [stock.code, stock.name]))
  const marketByCode = new Map(directoryStocks.map((stock) => [stock.code, stock.market]))

  return {
    items: TICKER_STOCK_CODES.map((code, index) => {
      const detail = mockStockDetails[code]
      const fallbackPrice = 48_000 + index * 1_850
      const fallbackChange = ((index % 7) - 3) * 0.41
      return {
        stockCode: code,
        stockName: detail?.stock.name ?? nameByCode.get(code) ?? code,
        market: detail?.stock.market ?? marketByCode.get(code) ?? 'KOSPI',
        imageUrl: detail?.stock.imageUrl ?? undefined,
        currentPrice: detail?.stock.price.current ?? fallbackPrice,
        changeRate: detail?.stock.price.changePercent ?? fallbackChange,
      }
    }),
  }
}
