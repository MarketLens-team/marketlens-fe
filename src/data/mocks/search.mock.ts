import { mockNewsFeed } from './news.mock'
import { mockPersonStatementsResponse } from './person.mock'
import { mockStockDirectory } from './stockDirectory.mock'
import type { FallbackSectionsResponse, SearchNewsItemResponse, SearchResponse } from '../types/searchApi'

function toSearchNewsItem(
  item: (typeof mockNewsFeed)[number],
  index: number,
  routing: Pick<SearchNewsItemResponse, 'sourceType' | 'primaryStockCode' | 'stocks' | 'persons'>,
): SearchNewsItemResponse {
  return {
    id: Number(item.id.replace(/\D/g, '')) || index + 1,
    title: item.title,
    description: item.summary ?? '',
    originalLink: 'https://example.com/news',
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl ?? '',
    sentimentScore: item.sentimentScore,
    sentiment: item.sentimentScore >= 0 ? 'positive' : 'negative',
    sourceType: routing.sourceType,
    primaryStockCode: routing.primaryStockCode,
    stocks: routing.stocks,
    persons: routing.persons,
  }
}

function newsDtoSlice(count: number): SearchNewsItemResponse[] {
  const sampleStock = mockStockDirectory.sectors[0]?.stocks[0]
  return mockNewsFeed.slice(0, count).map((item, index) =>
    toSearchNewsItem(item, index, {
      sourceType: 'stock',
      primaryStockCode: sampleStock?.code ?? '005930',
      stocks: sampleStock
        ? [{ stockCode: sampleStock.code, stockName: sampleStock.name, relevanceScore: 90 }]
        : [],
      persons: [],
    }),
  )
}

function buildMockFallbackSections(): FallbackSectionsResponse {
  const hotStocks = mockStockDirectory.sectors.flatMap((sector) =>
    sector.stocks.slice(0, 2).map((stock, index) => ({
      stockCode: stock.code,
      stockName: stock.name,
      market: stock.market,
      sectorCode: sector.sectorCode,
      sectorName: sector.sectorName,
      mentionCount: 420 - index * 37,
    })),
  )

  const topPersons = mockPersonStatementsResponse.slice(0, 5).map((row, index) => ({
    personId: row.personId,
    personName: row.personName,
    personRole: row.personRole,
    organizationName: row.organizationName,
    mentionCount: 120 - index * 18,
  }))

  return {
    hotStocks,
    topPersons,
    latestNews: newsDtoSlice(10),
  }
}

export function buildMockSearchResponse(query: string): SearchResponse {
  const normalized = query.trim().toLowerCase()
  const fallbackSections = buildMockFallbackSections()

  if (!normalized) {
    return { stocks: [], persons: [], news: [], fallbackSections }
  }

  const stocks = mockStockDirectory.sectors
    .flatMap((sector) =>
      sector.stocks.map((stock) => ({
        stock,
        sectorCode: sector.sectorCode,
        sectorName: sector.sectorName,
      })),
    )
    .filter(
      ({ stock }) =>
        stock.code.toLowerCase().includes(normalized) ||
        stock.name.toLowerCase().includes(normalized),
    )
    .slice(0, 5)
    .map(({ stock, sectorCode, sectorName }) => ({
      stockId: 0,
      stockCode: stock.code,
      stockName: stock.name,
      market: stock.market,
      sectorCode,
      sectorName,
      relatedNews: [],
    }))

  const persons = mockPersonStatementsResponse
    .filter(
      (row) =>
        row.personName.toLowerCase().includes(normalized) ||
        row.organizationName.toLowerCase().includes(normalized) ||
        row.personRole.toLowerCase().includes(normalized),
    )
    .slice(0, 3)
    .map((row) => ({
      personId: row.personId,
      personName: row.personName,
      personRole: row.personRole,
      organizationName: row.organizationName,
      relatedStatements: mockPersonStatementsResponse
        .filter((s) => s.personId === row.personId)
        .slice(0, 10)
        .map((s) => ({
          statementId: s.statementId,
          speechQuote: s.statementSummary,
          sourceName: s.sourceName,
          publishedAt: s.publishedAt,
          sentimentScore: s.score,
          sentiment: s.sentiment,
        })),
    }))

  return { stocks, persons, news: newsDtoSlice(10), fallbackSections }
}
