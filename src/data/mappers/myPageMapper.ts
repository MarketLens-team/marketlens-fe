import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import { toFiniteNumber } from '../../lib/toFiniteNumber'
import type { AlertSettingsResponse } from '../types/member'
import type { MemberResponse } from '../types/memberApi'
import type { StockSummaryMetrics } from '../types/stockApi'
import type { WatchlistResponse } from '../types/memberApi'
import type { MyPageAccount, MyPageData, MyPageSummary, MyPageWatchlistRow } from '../types/myPage'
import { MY_PAGE_WATCHLIST_MAX } from '../types/myPage'

const ATTENTION_SCORE_THRESHOLD = -30

export interface WatchlistOverviewPrice {
  price: number
  changePercent: number
}

export function mapWatchlistRow(
  item: WatchlistResponse,
  summary?: StockSummaryMetrics | null,
  overviewPrice?: WatchlistOverviewPrice | null,
): MyPageWatchlistRow {
  const sentimentScore = toFiniteNumber(summary?.score)
  return {
    code: item.stockCode,
    name: item.stockName,
    imageUrl: normalizeImageUrl(item.imageUrl),
    price: toFiniteNumber(overviewPrice?.price),
    changePercent: toFiniteNumber(overviewPrice?.changePercent),
    sentimentScore,
    mentionSurgePercent: toFiniteNumber(summary?.mentionChangeRate),
  }
}

export function buildMyPageSummary(rows: MyPageWatchlistRow[]): MyPageSummary {
  const watchlistCount = rows.length
  const positiveCount = rows.filter((row) => row.sentimentScore > 0).length
  const needsAttentionCount = rows.filter((row) => row.sentimentScore <= ATTENTION_SCORE_THRESHOLD).length
  const positiveRatioPercent =
    watchlistCount > 0 ? Math.round((positiveCount / watchlistCount) * 100) : 0

  return {
    watchlistCount,
    watchlistMax: MY_PAGE_WATCHLIST_MAX,
    positiveCount,
    positiveRatioPercent,
    needsAttentionCount,
  }
}

export function mapMemberAccount(member: MemberResponse): MyPageAccount {
  return {
    nickname: member.nickname,
    email: member.email,
    joinedAt: member.createdAt,
    plan: member.plan,
  }
}

function mapWatchlistRows(
  watchlist: WatchlistResponse[],
  summaries: Array<StockSummaryMetrics | null>,
  overviewPriceByCode?: Map<string, WatchlistOverviewPrice>,
): MyPageWatchlistRow[] {
  return watchlist.map((item, index) =>
    mapWatchlistRow(item, summaries[index], overviewPriceByCode?.get(item.stockCode)),
  )
}

/** 관심종목 탭 — watchlist · overview · batch만 */
export function mapMyPageWatchlistData(input: {
  watchlist: WatchlistResponse[]
  summaries: Array<StockSummaryMetrics | null>
  overviewPriceByCode?: Map<string, WatchlistOverviewPrice>
}): MyPageData {
  const rows = mapWatchlistRows(input.watchlist, input.summaries, input.overviewPriceByCode)
  return {
    summary: buildMyPageSummary(rows),
    watchlist: rows,
  }
}

/** 계정 탭 — settings · me */
export function mapMyPageAccountData(input: {
  settings: AlertSettingsResponse
  member: MemberResponse
  alertExample?: string
}): MyPageData {
  return {
    summary: buildMyPageSummary([]),
    watchlist: [],
    alertSettings: input.settings,
    alertExample:
      input.alertExample ??
      '삼성전자 감성 점수가 오늘 40점 하락했습니다 (+73 → +33)',
    account: mapMemberAccount(input.member),
  }
}
