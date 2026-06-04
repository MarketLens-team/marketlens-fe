import type { SentimentTimelinePoint } from './dashboard'

/** 뉴스 본문/구간별 감성 분석 적용 범위 */
export interface NewsAnalysisCoverage {
  /** 0–100, 분석 파이프라인이 커버한 비율(목 데이터 기준) */
  percent: number
  /** 적용된 구간 라벨 (예: 제목·리드, 본문 요약) */
  scopes: string[]
  /** 종목 단위 스코어 적용 요약 (예: "언급 5개 중 3개 스코어링") */
  entitySummary: string
}

export interface NewsPrimaryTicker {
  code: string
  name: string
}

export interface NewsFeedItem {
  id: string
  title: string
  summary: string
  /** 모달 본문 */
  body: string
  source: string
  reporter?: string
  /** ISO 8601 */
  publishedAt: string
  imageUrl: string | null
  /** -100 ~ 100 */
  sentimentScore: number
  coverage: NewsAnalysisCoverage
  /** 0–100 버즈 스코어 (MVP: 합성 지표 가정) */
  buzzScore: number
  primaryTicker: NewsPrimaryTicker
  /** 해당 종목 관련 뉴스 감성 추이 (일 단위 등) */
  sentimentTrend: SentimentTimelinePoint[]
}
