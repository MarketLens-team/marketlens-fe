import { sentimentLabel } from './sentimentGaugeShared'
import { pickDashboardAlerts } from './pickDashboardAlerts'
import { STOCK_SENTIMENT_NEUTRAL_BAND, formatStockScore } from '../stock/stockScore'
import type { DashboardBriefing, DashboardOverview } from '../../data/types/dashboard'

export function resolveDashboardAiBrief(
  briefing: DashboardBriefing | null | undefined,
  overview: DashboardOverview,
  options: { isLoggedIn: boolean },
): string {
  const apiSummary = briefing?.todaySummary?.trim()
  if (apiSummary) return apiSummary
  return buildDashboardAiBrief(overview, options)
}

export function buildDashboardAiBrief(
  overview: DashboardOverview,
  options: { isLoggedIn: boolean },
): string {
  const { watchlist, portfolioSentiment, buzzSurgeTop3, kospiSentiment, marketOutlierRows, sectorHeatmap } =
    overview
  const { isLoggedIn } = options

  if (!isLoggedIn) {
    const alerts = pickDashboardAlerts(marketOutlierRows, sectorHeatmap, 3, 'market')
    const stockNames = alerts.filter((alert) => alert.targetKind === 'stock').map((alert) => alert.name)
    if (stockNames.length > 0) {
      const lead = stockNames.slice(0, 2).join('·')
      return `오늘 ${lead} 등 시장 이상치가 두드러집니다. 로그인하면 관심 종목 기준 맞춤 브리핑을 받을 수 있어요.`
    }
    return '오늘 시장 이상치를 확인해 보세요. 로그인하면 관심 종목 기준으로 맞춤 요약을 받을 수 있어요.'
  }

  if (watchlist.length === 0) {
    return '관심 종목을 추가하면 포트폴리오 감성과 맞춤 요약을 확인할 수 있어요.'
  }

  const positiveCount = watchlist.filter(
    (row) => row.sentimentScore > STOCK_SENTIMENT_NEUTRAL_BAND,
  ).length
  const portfolioLabel = sentimentLabel(portfolioSentiment.score)

  const cautionNames = watchlist
    .filter(
      (row) =>
        row.changePercent < 0 || row.sentimentScore < -STOCK_SENTIMENT_NEUTRAL_BAND,
    )
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 2)
    .map((row) => row.name)

  const buzzInWatchlist = buzzSurgeTop3.find((item) =>
    watchlist.some((row) => row.code === item.code),
  )

  const lead = `관심 ${watchlist.length}종목 중 ${positiveCount}개가 긍정 감성이며, 포트폴리오는 ${portfolioLabel}(${formatStockScore(portfolioSentiment.score)})입니다.`

  if (cautionNames.length > 0) {
    return `${lead} ${cautionNames.join('·')}은(는) 등락·감성 이상치가 눈에 띕니다.`
  }

  if (buzzInWatchlist) {
    return `${lead} ${buzzInWatchlist.name} 언급량이 전일 대비 +${buzzInWatchlist.surgePercent}% 급증했어요.`
  }

  const kospiLabel = sentimentLabel(kospiSentiment.score)
  return `${lead} KOSPI 종합 감성은 ${kospiLabel}(${formatStockScore(kospiSentiment.score)})입니다.`
}
