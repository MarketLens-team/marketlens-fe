import { TICKER_STOCK_CODES } from '../constants/tickerStockCodes'
import { mockStockDirectory } from './stockDirectory.mock'
import { mockStockDetails } from './stock.mock'
import type { StockDirectory } from '../types/stockDirectory'
import type { StockPricesResponse } from '../types/stockApi'

function mockPriceItemForCode(code: string, index: number): StockPricesResponse['items'][number] {
  const directoryStocks = mockStockDirectory.sectors.flatMap((sector) => sector.stocks)
  const nameByCode = new Map(directoryStocks.map((stock) => [stock.code, stock.name]))
  const marketByCode = new Map(directoryStocks.map((stock) => [stock.code, stock.market]))
  const detail = mockStockDetails[code]
  const fallbackPrice = 48_000 + (index % 40) * 1_850
  const fallbackChange = ((index % 11) - 5) * 0.63

  return {
    stockCode: code,
    stockName: detail?.stock.name ?? nameByCode.get(code) ?? code,
    market: detail?.stock.market ?? marketByCode.get(code) ?? 'KOSPI',
    imageUrl: detail?.stock.imageUrl ?? undefined,
    currentPrice: detail?.stock.price.current ?? fallbackPrice,
    changeRate: detail?.stock.price.changePercent ?? fallbackChange,
  }
}

export function buildMockStockPricesResponse(): StockPricesResponse {
  return {
    items: TICKER_STOCK_CODES.map((code, index) => mockPriceItemForCode(code, index)),
  }
}

/** 전체 종목 페이지 — directory 전 종목 시세 */
export function buildMockStockPricesForDirectory(directory: StockDirectory): StockPricesResponse {
  const codes = directory.sectors.flatMap((sector) => sector.stocks.map((stock) => stock.code))
  return {
    items: codes.map((code, index) => mockPriceItemForCode(code, index)),
  }
}
