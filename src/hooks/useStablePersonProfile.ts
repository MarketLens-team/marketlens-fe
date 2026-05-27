import { useEffect, useState } from 'react'
import { personProfileFromMention } from '../data/mappers/personMapper'
import type { PersonMention, PersonProfileSummary } from '../data/types/person'

/** 피드 prepend 시 mentions[0]이 바뀌어도 상세 헤더 프로필이 흔들리지 않도록 고정 */
export function useStablePersonProfile(
  personId: number,
  mentions: PersonMention[] | undefined,
): PersonProfileSummary | null {
  const [profile, setProfile] = useState<PersonProfileSummary | null>(null)

  useEffect(() => {
    setProfile(null)
  }, [personId])

  useEffect(() => {
    if (!mentions?.length) return
    const id = String(personId)
    const match = mentions.find((m) => m.personId === id) ?? mentions[0]
    setProfile((prev) => {
      const next = personProfileFromMention(match)
      if (prev?.personId === next.personId) return prev
      return next
    })
  }, [mentions, personId])

  return profile
}
