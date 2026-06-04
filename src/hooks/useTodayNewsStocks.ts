import { useEffect, useRef, useState } from 'react'
import { fetchStockTodayNews } from '../data/clients/stockClient'
import type { StockTodayNewsItem } from '../data/types/stock'

export function useTodayNewsStocks() {
  const [items, setItems] = useState<StockTodayNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchStockTodayNews()
        if (cancelled || requestId !== requestIdRef.current) return
        setItems(data.items)
      } catch (e) {
        if (cancelled || requestId !== requestIdRef.current) return
        setError(e instanceof Error ? e.message : '오늘 뉴스 순위를 불러오지 못했습니다.')
        setItems([])
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading, error }
}
