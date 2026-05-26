import { useEffect, useState } from 'react'
import { fetchStockDirectory } from '../data/clients/stockClient'
import type { StockSectorGroup } from '../data/types/stockDirectory'

export function useStockDirectory() {
  const [sectors, setSectors] = useState<StockSectorGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchStockDirectory()
        if (!cancelled) setSectors(data.sectors)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('종목 목록을 불러오지 못했습니다.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { sectors, loading, error }
}
