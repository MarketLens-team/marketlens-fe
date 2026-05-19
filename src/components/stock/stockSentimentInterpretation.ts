export type SentimentTone = 'extremePositive' | 'positive' | 'neutral' | 'negative' | 'extremeNegative'

export function getSentimentTone(score: number): SentimentTone {
  if (score >= 60) return 'extremePositive'
  if (score >= 20) return 'positive'
  if (score >= -20) return 'neutral'
  if (score >= -60) return 'negative'
  return 'extremeNegative'
}

export function getSentimentZoneLabel(score: number): string {
  switch (getSentimentTone(score)) {
    case 'extremePositive':
      return '극도의 긍정'
    case 'positive':
      return '긍정'
    case 'neutral':
      return '중립'
    case 'negative':
      return '부정'
    case 'extremeNegative':
      return '극도의 부정'
  }
}

export function getSentimentInterpretation(score: number): string {
  switch (getSentimentTone(score)) {
    case 'extremePositive':
      return '언급·뉴스 톤이 매우 긍정적입니다.'
    case 'positive':
      return '전반적으로 긍정적인 분위기입니다.'
    case 'neutral':
      return '긍·부정이 혼재한 중립 구간입니다.'
    case 'negative':
      return '부정적 언급이 우세합니다.'
    case 'extremeNegative':
      return '극도로 부정적인 심리가 감지됩니다.'
  }
}
