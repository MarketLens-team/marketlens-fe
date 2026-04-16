import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStockSearch } from '../../data/clients/stockClient'
import type { StockSearchItem } from '../../data/types/stock'
import { useWatchlistStore } from '../../store/watchlistStore'
import { Modal } from '../ui/Modal'
import styles from './TopNavSearchModal.module.css'

interface TopNavSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TopNavSearchModal({ isOpen, onClose }: TopNavSearchModalProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<StockSearchItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { add, remove, has } = useWatchlistStore()

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setResults([])
    setError(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchStockSearch(trimmed)
        if (!cancelled) setResults(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 160)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      setLoading(false)
    }
  }, [isOpen, query])

  const displayResults = useMemo(() => results.slice(0, 10), [results])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnEsc
      closeOnOverlay
      contentClassName={styles.dialogContent}
      bodyClassName={styles.dialogBody}
      initialFocusRef={inputRef}
    >
      <section aria-label="종목 검색">
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명 또는 종목코드로 검색하세요..."
          />
          <span className={styles.inputIcon} aria-hidden>
            ⌕
          </span>
        </div>

        <div className={styles.sectionLabel}>종목</div>

        {loading ? <p className={styles.empty}>검색 중...</p> : null}
        {error ? <p className={styles.empty}>{error}</p> : null}
        {!loading && !error && query.trim() && displayResults.length === 0 ? (
          <p className={styles.empty}>검색 결과가 없습니다.</p>
        ) : null}

        <ul className={styles.resultList}>
          {displayResults.map((item) => {
            const inWatchlist = has(item.code)
            return (
              <li key={item.code} className={styles.resultItem}>
                <div className={styles.left}>
                  <p className={styles.name}>{item.name}</p>
                  <p className={styles.code}>{item.code}</p>
                </div>
                <div className={styles.right}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => {
                      if (inWatchlist) remove(item.code)
                      else add(item)
                    }}
                  >
                    {inWatchlist ? '관심해제' : '관심추가'}
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => {
                      navigate(`/stock/${item.code}`)
                      onClose()
                    }}
                  >
                    상세보기
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <div className={styles.footerHints}>
          <span>종목 상세로 이동 가능</span>
          <span>관심목록 즉시 반영</span>
          <span>ESC 모달 닫기</span>
        </div>
      </section>
    </Modal>
  )
}
