import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mapPersonTrackerPage } from '../mappers/personMapper'
import { mockPersonTrackerPage } from '../mocks/person.mock'
import type { ApiEnvelope } from '../types/api'
import type { PersonTrackerPageData } from '../types/person'
import type { PersonStatementResponse, PersonTopResponse } from '../types/personApi'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const PERSONS_BASE = '/api/v1/persons'

export interface FetchPersonMentionsParams {
  personId?: number
}

async function getPersonApiData<T>(path: string, fallbackMessage: string, params?: Record<string, unknown>) {
  try {
    const { data } = await api.get<ApiEnvelope<T>>(path, { params })
    return unwrapApiEnvelope(data, fallbackMessage)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage))
  }
}

/** OpenAPI `getMentions` — `GET /api/v1/persons/mentions` */
export async function fetchPersonStatements(
  params?: FetchPersonMentionsParams,
): Promise<PersonStatementResponse[]> {
  return getPersonApiData<PersonStatementResponse[]>(
    `${PERSONS_BASE}/mentions`,
    '인물 발언을 불러오지 못했습니다.',
    params as Record<string, unknown> | undefined,
  )
}

/** OpenAPI `getTopPersons` — `GET /api/v1/persons/top` */
export async function fetchPersonTop(): Promise<PersonTopResponse[]> {
  return getPersonApiData<PersonTopResponse[]>(`${PERSONS_BASE}/top`, '화제 인물을 불러오지 못했습니다.')
}

export async function fetchPersonTrackerPage(params?: FetchPersonMentionsParams): Promise<PersonTrackerPageData> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockPersonTrackerPage)
  }

  const [mentions, topPersons] = await Promise.all([
    fetchPersonStatements(params),
    fetchPersonTop(),
  ])

  return mapPersonTrackerPage(mentions, topPersons)
}

/** @deprecated fetchPersonTrackerPage 사용 */
export async function fetchPersonMentions(): Promise<PersonTrackerPageData['mentions']> {
  const page = await fetchPersonTrackerPage()
  return page.mentions
}
