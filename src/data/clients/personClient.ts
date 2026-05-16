import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import { mockPersonMentions } from '../mocks/person.mock'
import type { PersonMention } from '../types/person'
import type { PersonStatementDto } from '../types/personApi'
import type { SentimentPolarity } from '../types/stock'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const MENTIONS_PATH = '/api/v1/persons/mentions'

function toSentiment(raw: string): SentimentPolarity {
  const value = raw.toLowerCase()
  if (value === 'positive' || value === 'negative' || value === 'neutral') {
    return value
  }
  return 'neutral'
}

function mapPersonStatement(dto: PersonStatementDto): PersonMention {
  return {
    id: String(dto.statementId),
    personName: dto.personName,
    role: dto.personRole,
    context: dto.statementSummary,
    stockCodes: (dto.relatedStocks ?? []).map((stock) => stock.stockCode),
    publishedAt: dto.publishedAt,
    sentiment: toSentiment(dto.sentiment),
  }
}

export async function fetchPersonMentions(): Promise<PersonMention[]> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockPersonMentions)
  }
  try {
    const { data: body } = await api.get<ApiEnvelope<PersonStatementDto[]>>(MENTIONS_PATH)
    const rows = unwrapApiEnvelope(body, '인물 언급을 불러오지 못했습니다.')
    return (rows ?? []).map(mapPersonStatement)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '인물 언급을 불러오지 못했습니다.'))
  }
}
