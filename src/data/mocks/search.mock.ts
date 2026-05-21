import { mockNewsFeed } from './news.mock'
import { mockPersonStatementsResponse } from './person.mock'
import { mockStockDirectory } from './stockDirectory.mock'
import type { FallbackSectionsResponse, SearchResponse } from '../types/searchApi'

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

function buildMockFallbackSections(): FallbackSectionsResponse {
  const hotStocks = [
    { stockCode: '000660', stockName: 'SK하이닉스', mentionCount: 482 },
    { stockCode: '005930', stockName: '삼성전자', mentionCount: 391 },
    { stockCode: '006400', stockName: '삼성SDI', mentionCount: 256 },
    { stockCode: '035720', stockName: '카카오', mentionCount: 198 },
    { stockCode: '068270', stockName: '셀트리온', mentionCount: 174 },
  ]

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
    return { stocks: [], persons: [], fallbackSections }
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

  return { stocks, persons, fallbackSections }
}
