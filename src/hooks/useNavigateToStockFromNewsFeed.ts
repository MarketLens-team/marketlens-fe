import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildStockDetailPath } from '../lib/buildStockRoute'
import { saveNewsFeedSessionBeforeStockNav } from '../lib/newsFeedSession'

/** 관련 종목 클릭 시 session 저장 + 히스토리만 `/news?newsId=`로 바꾼 뒤 종목 상세 이동 */
export function useNavigateToStockFromNewsFeed() {
  const navigate = useNavigate()

  return useCallback(
    (stockCode: string, newsId: string) => {
      saveNewsFeedSessionBeforeStockNav(newsId)

      const returnSearch = new URLSearchParams(window.location.search)
      returnSearch.set('newsId', newsId)
      const returnPath = `${window.location.pathname}?${returnSearch.toString()}`
      /* setSearchParams는 /news를 재렌더해 consume이 즉시 실행되므로 replaceState만 사용 */
      window.history.replaceState(window.history.state, '', returnPath)

      navigate(
        buildStockDetailPath(stockCode, {
          newsId,
          scrollToNews: false,
        }),
      )
    },
    [navigate],
  )
}
