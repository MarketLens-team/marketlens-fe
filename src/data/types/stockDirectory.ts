export interface StockDirectoryItem {
  code: string
  name: string
  market?: string
}

export interface StockSectorGroup {
  sectorCode: string
  sectorName: string
  stocks: StockDirectoryItem[]
}

export interface StockDirectory {
  sectors: StockSectorGroup[]
}
