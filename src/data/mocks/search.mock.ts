import { mockNewsFeed } from './news.mock'
import { mockPersonStatementsResponse } from './person.mock'
import { mockStockDirectory } from './stockDirectory.mock'
import type { SearchResponse } from '../types/searchApi'

function newsDtoSlice(count: number) {
  return mockNewsFeed.slice(0, count).map((item, index) => ({
    id: Number(item.id.replace(/\D/g, '')) || index + 1,
    title: item.title,
    description: item.summary ?? '',
    originalLink: 'https://example.com/news',
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl ?? '',
    sentimentScore: item.sentimentScore,
    sentiment: item.sentimentScore >= 0 ? 'positive' : 'negative',
  }))
}

export function buildMockSearchResponse(query: string): SearchResponse {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return { stocks: [], persons: [] }
  }

  const stocks = mockStockDirectory.sectors
    .flatMap((sector) =>
      sector.stocks.map((stock) => ({
        stock,
        sectorName: sector.sectorName,
      })),
    )
    .filter(
      ({ stock }) =>
        stock.code.toLowerCase().includes(normalized) ||
        stock.name.toLowerCase().includes(normalized),
    )
    .slice(0, 5)
    .map(({ stock, sectorName }) => ({
      stockId: 0,
      stockCode: stock.code,
      stockName: stock.name,
      market: stock.market,
      sectorName,
      relatedNews: newsDtoSlice(10),
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
      relatedNews: newsDtoSlice(3),
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

  return { stocks, persons }
}
