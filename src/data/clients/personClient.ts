import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockPersonMentions } from '../mocks/person.mock'
import type { PersonMention } from '../types/person'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시: `GET /api/v1/persons/mentions` */
const MENTIONS_PATH = '/api/v1/persons/mentions'

export async function fetchPersonMentions(): Promise<PersonMention[]> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockPersonMentions)
  }
  const { data } = await api.get<PersonMention[]>(MENTIONS_PATH)
  return data
}
