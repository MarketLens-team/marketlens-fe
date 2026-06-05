import { useCallback } from 'react'
import { fetchMyPage } from '../data/clients/myPageClient'
import type { MyPageData } from '../data/types/myPage'
import { useAsyncData } from './useAsyncData'

export function useMyPage() {
  const factory = useCallback(() => fetchMyPage('watchlist'), [])
  return useAsyncData<MyPageData>(factory)
}
