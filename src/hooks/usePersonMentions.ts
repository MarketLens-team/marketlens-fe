import { useCallback } from 'react'
import { fetchPersonMentions } from '../data/clients/personClient'
import type { PersonMention } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonMentions() {
  const factory = useCallback(() => fetchPersonMentions(), [])
  return useAsyncData<PersonMention[]>(factory)
}
