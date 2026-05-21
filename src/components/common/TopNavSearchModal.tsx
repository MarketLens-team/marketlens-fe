import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUnifiedSearch } from '../../data/clients/searchClient'
import type {
  SearchNewsPreview,
  SearchPersonResult,
  SearchStatementPreview,
  SearchStockResult,
  UnifiedSearchResult,
} from '../../data/types/search'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { useWatchlistStore } from '../../store/watchlistStore'
import { Modal } from '../ui/Modal'
import styles from './TopNavSearchModal.module.css'

interface TopNavSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type SearchDomain = 'stock' | 'person'
type StockFilter = 'all' | 'stock' | 'news'
type PersonFilter = 'all' | 'person' | 'statement' | 'news'

const STOCK_FILTERS: { key: StockFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'stock', label: '종목' },
  { key: 'news', label: '뉴스' },
]

const PERSON_FILTERS: { key: PersonFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'person', label: '인물' },
  { key: 'statement', label: '발언' },
  { key: 'news', label: '뉴스' },
]

function formatNewsMeta(iso: string) {
  return `${formatNewsDateLong(iso)} · ${formatNewsTimeBadge(iso)}`
}

type NewsWithContext = SearchNewsPreview & { contextLabel?: string; rowKey: string }

function flattenStockNews(stocks: SearchStockResult[]): NewsWithContext[] {
  const rows: NewsWithContext[] = []
  for (const stock of stocks) {
    for (const item of stock.relatedNews) {
      rows.push({
        ...item,
        rowKey: `stock-${stock.code}-${item.id}`,
        contextLabel: `${stock.name} · ${stock.code}`,
      })
    }
  }
  return rows
}

function flattenPersonNews(persons: SearchPersonResult[]): NewsWithContext[] {
  const rows: NewsWithContext[] = []
  for (const person of persons) {
    for (const item of person.relatedNews) {
      rows.push({
        ...item,
        rowKey: `person-${person.personId}-${item.id}`,
        contextLabel: person.personName,
      })
    }
  }
  return rows
}

type StatementWithContext = SearchStatementPreview & { personName: string; rowKey: string }

function flattenPersonStatements(persons: SearchPersonResult[]): StatementWithContext[] {
  const rows: StatementWithContext[] = []
  for (const person of persons) {
    for (const item of person.relatedStatements) {
      rows.push({
        ...item,
        personName: person.personName,
        rowKey: `stmt-${person.personId}-${item.id}`,
      })
    }
  }
  return rows
}

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
}) {
  return (
    <div className={styles.filterRow} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={value === opt.key}
          className={clsx(styles.filterChip, value === opt.key && styles.filterChipActive)}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ResultSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionLabel}>{label}</h3>
      <div className={styles.resultPanel}>{children}</div>
    </section>
  )
}

function SearchNewsRows({ items }: { items: NewsWithContext[] }) {
  if (items.length === 0) return null

  return (
    <ul className={styles.newsList}>
      {items.map((item) => (
        <li key={item.rowKey} className={styles.newsItem}>
          {item.url ? (
            <a
              className={styles.newsLink}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SearchNewsRowContent item={item} />
            </a>
          ) : (
            <div className={styles.newsLink}>
              <SearchNewsRowContent item={item} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function SearchNewsRowContent({ item }: { item: NewsWithContext }) {
  return (
    <>
      <div className={styles.newsText}>
        <p className={styles.newsTitle}>{item.title}</p>
        <p className={styles.newsMeta}>
          {item.contextLabel ? `${item.contextLabel} · ` : ''}
          {item.source} · {formatNewsMeta(item.publishedAt)}
        </p>
      </div>
      {item.imageUrl ? (
        <img className={styles.newsThumb} src={item.imageUrl} alt="" width={96} height={64} loading="lazy" />
      ) : (
        <div className={styles.newsThumbPlaceholder} aria-hidden />
      )}
    </>
  )
}

function StockResultList({
  stocks,
  onClose,
}: {
  stocks: SearchStockResult[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { add, remove, has } = useWatchlistStore()

  return (
    <ul className={styles.stockList}>
      {stocks.map((stock) => {
        const inWatchlist = has(stock.code)
        return (
          <li key={stock.code} className={styles.stockRow}>
            <div className={styles.stockIdentity}>
              <p className={styles.stockName}>{stock.name}</p>
              <p className={styles.stockMeta}>
                {stock.code}
                {stock.market ? ` · ${stock.market}` : ''}
                {stock.sectorName ? ` · ${stock.sectorName}` : ''}
              </p>
            </div>
            <div className={styles.stockActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => {
                  if (inWatchlist) remove(stock.code)
                  else add({ code: stock.code, name: stock.name })
                }}
              >
                {inWatchlist ? '관심해제' : '관심추가'}
              </button>
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.actionBtnPrimary)}
                onClick={() => {
                  navigate(`/stock/${stock.code}`)
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
  )
}

function PersonResultList({
  persons,
  onClose,
}: {
  persons: SearchPersonResult[]
  onClose: () => void
}) {
  const navigate = useNavigate()

  return (
    <ul className={styles.personList}>
      {persons.map((person) => (
        <li key={person.personId} className={styles.personRow}>
          <div className={styles.stockIdentity}>
            <p className={styles.personName}>{person.personName}</p>
            <p className={styles.personMeta}>
              {person.organizationName}
              {person.role ? ` · ${person.role}` : ''}
            </p>
          </div>
          <div className={styles.stockActions}>
            <button
              type="button"
              className={clsx(styles.actionBtn, styles.actionBtnPrimary)}
              onClick={() => {
                navigate('/person')
                onClose()
              }}
            >
              인물 보기
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function StatementRows({ items }: { items: StatementWithContext[] }) {
  if (items.length === 0) return null

  return (
    <ul className={styles.statementList}>
      {items.map((stmt) => (
        <li key={stmt.rowKey} className={styles.statementItem}>
          <p className={styles.statementPerson}>{stmt.personName}</p>
          <p className={styles.statementQuote}>{stmt.quote}</p>
          <p className={styles.statementMeta}>
            {stmt.sourceName} · {formatNewsMeta(stmt.publishedAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}

function StockSearchResults({
  stocks,
  stockNewsFlat,
  filter,
  onClose,
}: {
  stocks: SearchStockResult[]
  stockNewsFlat: NewsWithContext[]
  filter: StockFilter
  onClose: () => void
}) {
  if (filter === 'stock') {
    if (stocks.length === 0) return <p className={styles.empty}>종목 결과가 없습니다.</p>
    return (
      <ResultSection label="종목">
        <StockResultList stocks={stocks} onClose={onClose} />
      </ResultSection>
    )
  }

  if (filter === 'news') {
    if (stockNewsFlat.length === 0) return <p className={styles.empty}>뉴스 결과가 없습니다.</p>
    return (
      <ResultSection label="뉴스">
        <SearchNewsRows items={stockNewsFlat} />
      </ResultSection>
    )
  }

  if (stocks.length === 0 && stockNewsFlat.length === 0) {
    return <p className={styles.empty}>검색 결과가 없습니다.</p>
  }

  return (
    <>
      {stocks.length > 0 ? (
        <ResultSection label="종목">
          <StockResultList stocks={stocks} onClose={onClose} />
        </ResultSection>
      ) : null}
      {stockNewsFlat.length > 0 ? (
        <ResultSection label="뉴스">
          <SearchNewsRows items={stockNewsFlat} />
        </ResultSection>
      ) : null}
    </>
  )
}

function PersonSearchResults({
  persons,
  personNewsFlat,
  personStatementsFlat,
  filter,
  onClose,
}: {
  persons: SearchPersonResult[]
  personNewsFlat: NewsWithContext[]
  personStatementsFlat: StatementWithContext[]
  filter: PersonFilter
  onClose: () => void
}) {
  if (filter === 'person') {
    if (persons.length === 0) return <p className={styles.empty}>인물 결과가 없습니다.</p>
    return (
      <ResultSection label="인물">
        <PersonResultList persons={persons} onClose={onClose} />
      </ResultSection>
    )
  }

  if (filter === 'statement') {
    if (personStatementsFlat.length === 0) return <p className={styles.empty}>발언 결과가 없습니다.</p>
    return (
      <ResultSection label="발언">
        <StatementRows items={personStatementsFlat} />
      </ResultSection>
    )
  }

  if (filter === 'news') {
    if (personNewsFlat.length === 0) return <p className={styles.empty}>뉴스 결과가 없습니다.</p>
    return (
      <ResultSection label="뉴스">
        <SearchNewsRows items={personNewsFlat} />
      </ResultSection>
    )
  }

  if (persons.length === 0 && personNewsFlat.length === 0 && personStatementsFlat.length === 0) {
    return <p className={styles.empty}>검색 결과가 없습니다.</p>
  }

  return (
    <>
      {persons.length > 0 ? (
        <ResultSection label="인물">
          <PersonResultList persons={persons} onClose={onClose} />
        </ResultSection>
      ) : null}
      {personStatementsFlat.length > 0 ? (
        <ResultSection label="발언">
          <StatementRows items={personStatementsFlat} />
        </ResultSection>
      ) : null}
      {personNewsFlat.length > 0 ? (
        <ResultSection label="뉴스">
          <SearchNewsRows items={personNewsFlat} />
        </ResultSection>
      ) : null}
    </>
  )
}

export function TopNavSearchModal({ isOpen, onClose }: TopNavSearchModalProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UnifiedSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [domain, setDomain] = useState<SearchDomain>('stock')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [personFilter, setPersonFilter] = useState<PersonFilter>('all')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setResults(null)
    setError(null)
    setDomain('stock')
    setStockFilter('all')
    setPersonFilter('all')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const trimmed = query.trim()
    if (!trimmed) {
      setResults(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchUnifiedSearch(trimmed)
        if (!cancelled) {
          setResults(data)
          setError(null)
          const hasStocks = data.stocks.length > 0
          const hasPersons = data.persons.length > 0
          if (hasStocks && hasPersons) {
            setDomain((prev) => (prev === 'person' ? 'person' : 'stock'))
          } else if (hasPersons) {
            setDomain('person')
          } else {
            setDomain('stock')
          }
        }
      } catch (e) {
        if (!cancelled) {
          setResults(null)
          setError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      setLoading(false)
    }
  }, [isOpen, query])

  useEffect(() => {
    setStockFilter('all')
    setPersonFilter('all')
  }, [query])

  useEffect(() => {
    setStockFilter('all')
    setPersonFilter('all')
  }, [domain])

  const trimmedQuery = query.trim()
  const stocks = results?.stocks ?? []
  const persons = results?.persons ?? []

  const stockNewsFlat = useMemo(() => flattenStockNews(stocks), [stocks])
  const personNewsFlat = useMemo(() => flattenPersonNews(persons), [persons])
  const personStatementsFlat = useMemo(() => flattenPersonStatements(persons), [persons])

  const hasStocks = stocks.length > 0
  const hasPersons = persons.length > 0
  const showDomainTabs = Boolean(trimmedQuery && results && hasStocks && hasPersons)

  const effectiveDomain: SearchDomain = useMemo(() => {
    if (!hasStocks && !hasPersons) return domain
    if (hasStocks && !hasPersons) return 'stock'
    if (!hasStocks && hasPersons) return 'person'
    return domain
  }, [hasStocks, hasPersons, domain])

  const domainOptions = useMemo(
    () => [
      { key: 'stock' as const, label: `종목 (${stocks.length})` },
      { key: 'person' as const, label: `인물 (${persons.length})` },
    ],
    [stocks.length, persons.length],
  )

  const hasResults = hasStocks || hasPersons

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
      <section aria-label="통합 검색">
        <div className={styles.inputRow}>
          <span className={styles.inputIcon} aria-hidden>
            ⌕
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명·코드, 인물명으로 검색..."
          />
          {query ? (
            <button
              type="button"
              className={styles.inputClear}
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
            >
              지우기
            </button>
          ) : null}
        </div>

        {showDomainTabs ? (
          <FilterChips options={domainOptions} value={domain} onChange={setDomain} />
        ) : null}

        {trimmedQuery && results && (effectiveDomain === 'stock' ? hasStocks : hasPersons) ? (
          <FilterChips
            options={effectiveDomain === 'stock' ? STOCK_FILTERS : PERSON_FILTERS}
            value={effectiveDomain === 'stock' ? stockFilter : personFilter}
            onChange={(key) => {
              if (effectiveDomain === 'stock') setStockFilter(key as StockFilter)
              else setPersonFilter(key as PersonFilter)
            }}
          />
        ) : null}

        <div className={styles.scrollBody}>
          {loading ? <p className={styles.empty}>검색 중...</p> : null}
          {error ? <p className={styles.empty}>{error}</p> : null}
          {!loading && !error && trimmedQuery && !hasResults ? (
            <p className={styles.empty}>검색 결과가 없습니다.</p>
          ) : null}

          {!loading && !error && trimmedQuery && results && effectiveDomain === 'stock' ? (
            <StockSearchResults
              stocks={stocks}
              stockNewsFlat={stockNewsFlat}
              filter={stockFilter}
              onClose={onClose}
            />
          ) : null}

          {!loading && !error && trimmedQuery && results && effectiveDomain === 'person' ? (
            <PersonSearchResults
              persons={persons}
              personNewsFlat={personNewsFlat}
              personStatementsFlat={personStatementsFlat}
              filter={personFilter}
              onClose={onClose}
            />
          ) : null}
        </div>

        <div className={styles.footerHints}>
          <span>종목·인물 분리 검색</span>
          <span>관심목록 즉시 반영</span>
          <span>ESC 모달 닫기</span>
        </div>
      </section>
    </Modal>
  )
}
