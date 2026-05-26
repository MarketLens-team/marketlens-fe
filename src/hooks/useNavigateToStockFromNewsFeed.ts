import { flushSync } from 'react-dom'
import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buildStockDetailPath } from '../lib/buildStockRoute'

/** 관련 종목 클릭 시 현재 히스토리를 `/news?newsId=`로 남긴 뒤 종목 상세로 이동 (뒤로가기 복귀용) */
export function useNavigateToStockFromNewsFeed() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  return useCallback(
    (stockCode: string, newsId: string) => {
      const next = new URLSearchParams(searchParams)
      next.set('newsId', newsId)
      flushSync(() => {
        setSearchParams(next, { replace: true })
      })
      navigate(
        buildStockDetailPath(stockCode, {
          newsId,
          scrollToNews: false,
        }),
      )
    },
    [navigate, searchParams, setSearchParams],
  )
}
