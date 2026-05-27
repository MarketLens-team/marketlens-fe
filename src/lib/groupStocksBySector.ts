export interface StockSectorFields {
  sectorCode?: string
  sectorName?: string
}

export interface StockSectorGroup<T extends StockSectorFields> {
  sectorKey: string
  sectorName: string
  items: T[]
}

/** fallback·검색 종목을 업종(섹터) 단위로 묶음 — OpenAPI `sectorCode` / `sectorName` 기준 */
export function groupStocksBySector<T extends StockSectorFields>(
  stocks: T[],
): StockSectorGroup<T>[] {
  const order: string[] = []
  const map = new Map<string, T[]>()

  for (const stock of stocks) {
    const sectorName = stock.sectorName?.trim() || '기타'
    const sectorKey = stock.sectorCode?.trim() || sectorName
    if (!map.has(sectorKey)) {
      map.set(sectorKey, [])
      order.push(sectorKey)
    }
    map.get(sectorKey)!.push(stock)
  }

  return order.map((sectorKey) => {
    const items = map.get(sectorKey) ?? []
    const sectorName = items[0]?.sectorName?.trim() || '기타'
    return { sectorKey, sectorName, items }
  })
}
