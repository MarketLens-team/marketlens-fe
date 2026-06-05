import type { BuzzSurgeItem, DashboardWatchlistRow } from '../types/dashboard'
import type { StockRankings } from '../types/stock'

function upsertRow(
  map: Map<string, DashboardWatchlistRow>,
  row: DashboardWatchlistRow,
): void {
  const existing = map.get(row.code)
  if (!existing) {
    map.set(row.code, row)
    return
  }
  map.set(row.code, {
    ...existing,
    name: existing.name || row.name,
    imageUrl: existing.imageUrl ?? row.imageUrl,
    price: existing.price > 0 ? existing.price : row.price,
    changePercent:
      Math.abs(existing.changePercent) >= Math.abs(row.changePercent)
        ? existing.changePercent
        : row.changePercent,
    sentimentScore:
      Math.abs(existing.sentimentScore) >= Math.abs(row.sentimentScore)
        ? existing.sentimentScore
        : row.sentimentScore,
    newsCount: Math.max(existing.newsCount, row.newsCount),
    mentionSurgePercent: Math.max(existing.mentionSurgePercent, row.mentionSurgePercent),
  })
}

/** 비로그인 홈 이상치 — rankings·buzzTop3를 watchlist row 형태로 합침 */
export function buildMarketOutlierRows(
  buzzTop3: BuzzSurgeItem[],
  rankings: StockRankings | null,
): DashboardWatchlistRow[] {
  const byCode = new Map<string, DashboardWatchlistRow>()

  if (rankings) {
    for (const item of [
      ...rankings.topChangeRate,
      ...rankings.topSentimentScore,
      ...rankings.topMentionCount,
    ]) {
      upsertRow(byCode, {
        name: item.name,
        code: item.code,
        imageUrl: item.imageUrl,
        price: item.price,
        changePercent: item.changePercent,
        sentimentScore: item.sentimentScore24h,
        newsCount: item.mentionCount24h,
        mentionSurgePercent: item.mentionChangeRate24h,
      })
    }
  }

  for (const item of buzzTop3) {
    upsertRow(byCode, {
      name: item.name,
      code: item.code,
      price: 0,
      changePercent: 0,
      sentimentScore: 0,
      newsCount: 0,
      mentionSurgePercent: item.surgePercent,
    })
  }

  return [...byCode.values()]
}
