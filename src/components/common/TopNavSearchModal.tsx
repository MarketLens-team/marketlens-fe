import clsx from 'clsx'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUnifiedSearch } from '../../data/clients/searchClient'
import type {
  SearchFallbackPerson,
  SearchFallbackSections,
  SearchNewsPreview,
  SearchPersonResult,
  SearchStatementPreview,
  SearchStockResult,
  UnifiedSearchResult,
} from '../../data/types/search'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { groupStocksBySector } from '../../lib/groupStocksBySector'
import { useWatchlistStore } from '../../store/watchlistStore'
import { Modal } from '../ui/Modal'
import { UnderlineTabNav } from './UnderlineTabNav'
import styles from './TopNavSearchModal.module.css'

type SearchModalSeed =
  | { kind: 'success'; results: UnifiedSearchResult }
  | { kind: 'error'; message: string }

interface TopNavSearchModalProps {
  isOpen: boolean
  seed: SearchModalSeed
  onClose: () => void
}

function syncDomainFromResults(
  data: UnifiedSearchResult,
  setDomain: Dispatch<SetStateAction<SearchDomain>>,
) {
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

type SearchDomain = 'stock' | 'person'
type StockFilter = 'all' | 'stock' | 'news'
type PersonFilter = 'all' | 'person' | 'statement' | 'news'
type FallbackFilter = 'all' | 'stock' | 'person' | 'news'

const FALLBACK_FILTERS: { key: FallbackFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'stock', label: '종목' },
  { key: 'person', label: '인물' },
  { key: 'news', label: '뉴스' },
]

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

function formatMentionCount(count: number) {
  return `언급 ${count.toLocaleString('ko-KR')}`
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

function ResultSection({
  label,
  children,
  variant = 'panel',
}: {
  label: string
  children: ReactNode
  variant?: 'panel' | 'rows'
}) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionLabel}>{label}</h3>
      <div className={variant === 'rows' ? styles.resultPanelRows : styles.resultPanel}>
        {children}
      </div>
    </section>
  )
}

type StockSearchRowModel = {
  code: string
  name: string
  market?: string
  sectorCode?: string
  sectorName?: string
  mentionCount?: number
}

function StockSearchRow({
  stock,
  onClose,
  showMentionCount,
}: {
  stock: StockSearchRowModel
  onClose: () => void
  showMentionCount?: boolean
}) {
  const navigate = useNavigate()
  const { add, remove, has } = useWatchlistStore()
  const inWatchlist = has(stock.code)

  return (
    <li
      className={clsx(
        styles.searchRow,
        showMentionCount ? styles.searchRowWithStat : styles.searchRowTwoCol,
      )}
    >
      <div className={styles.stockIdentity}>
        <p className={styles.stockName}>{stock.name}</p>
        <p className={styles.stockMeta}>
          {stock.code}
          {stock.market ? ` · ${stock.market}` : ''}
        </p>
      </div>
      {showMentionCount && stock.mentionCount != null ? (
        <p className={styles.searchRowStat}>{formatMentionCount(stock.mentionCount)}</p>
      ) : null}
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
}

function StockRowsBySector({
  stocks,
  onClose,
  showMentionCount = false,
}: {
  stocks: StockSearchRowModel[]
  onClose: () => void
  showMentionCount?: boolean
}) {
  const groups = useMemo(() => groupStocksBySector(stocks), [stocks])

  if (groups.length === 0) return null

  return (
    <>
      {groups.map((group) => (
        <ResultSection key={group.sectorKey} label={group.sectorName} variant="rows">
          <ul className={styles.rowList}>
            {group.items.map((stock) => (
              <StockSearchRow
                key={stock.code}
                stock={stock}
                onClose={onClose}
                showMentionCount={showMentionCount}
              />
            ))}
          </ul>
        </ResultSection>
      ))}
    </>
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

function StockResultList({ stocks, onClose }: { stocks: SearchStockResult[]; onClose: () => void }) {
  return <StockRowsBySector stocks={stocks} onClose={onClose} />
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
    <ul className={styles.rowList}>
      {persons.map((person) => (
        <li key={person.personId} className={clsx(styles.searchRow, styles.searchRowTwoCol)}>
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
    return <StockResultList stocks={stocks} onClose={onClose} />
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
      {stocks.length > 0 ? <StockResultList stocks={stocks} onClose={onClose} /> : null}
      {stockNewsFlat.length > 0 ? (
        <ResultSection label="뉴스">
          <SearchNewsRows items={stockNewsFlat} />
        </ResultSection>
      ) : null}
    </>
  )
}

function FallbackPersonList({
  persons,
  onClose,
}: {
  persons: SearchFallbackPerson[]
  onClose: () => void
}) {
  const navigate = useNavigate()

  return (
    <ul className={styles.rowList}>
      {persons.map((person) => (
        <li key={person.personId} className={clsx(styles.searchRow, styles.searchRowTwoCol)}>
          <div className={styles.stockIdentity}>
            <p className={styles.personName}>{person.personName}</p>
            <p className={styles.personMeta}>
              {person.organizationName}
              {person.role ? ` · ${person.role}` : ''} · {formatMentionCount(person.mentionCount)}
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

function SearchFallbackResults({
  fallback,
  filter,
  onClose,
}: {
  fallback: SearchFallbackSections
  filter: FallbackFilter
  onClose: () => void
}) {
  const latestNewsRows: NewsWithContext[] = fallback.latestNews.map((item) => ({
    ...item,
    rowKey: `fallback-news-${item.id}`,
  }))

  if (filter === 'stock') {
    const fallbackStocks = fallback.stockSectors.flatMap((sector) => sector.stocks)
    if (fallbackStocks.length === 0) {
      return <p className={styles.empty}>추천 종목이 없습니다.</p>
    }
    return <StockRowsBySector stocks={fallbackStocks} onClose={onClose} showMentionCount />
  }

  if (filter === 'person') {
    if (fallback.topPersons.length === 0) {
      return <p className={styles.empty}>추천 인물이 없습니다.</p>
    }
    return (
      <ResultSection label="오늘 화제 인물">
        <FallbackPersonList persons={fallback.topPersons} onClose={onClose} />
      </ResultSection>
    )
  }

  if (filter === 'news') {
    if (fallback.latestNews.length === 0) {
      return <p className={styles.empty}>추천 뉴스가 없습니다.</p>
    }
    return (
      <ResultSection label="최신 뉴스">
        <SearchNewsRows items={latestNewsRows} />
      </ResultSection>
    )
  }

  if (
    fallback.stockSectors.length === 0 &&
    fallback.topPersons.length === 0 &&
    fallback.latestNews.length === 0
  ) {
    return <p className={styles.empty}>추천 콘텐츠가 없습니다.</p>
  }

  const fallbackStocks = fallback.stockSectors.flatMap((sector) => sector.stocks)

  return (
    <>
      {fallbackStocks.length > 0 ? (
        <StockRowsBySector stocks={fallbackStocks} onClose={onClose} showMentionCount />
      ) : null}
      {fallback.topPersons.length > 0 ? (
        <ResultSection label="오늘 화제 인물" variant="rows">
          <FallbackPersonList persons={fallback.topPersons} onClose={onClose} />
        </ResultSection>
      ) : null}
      {fallback.latestNews.length > 0 ? (
        <ResultSection label="최신 뉴스">
          <SearchNewsRows items={latestNewsRows} />
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

export function TopNavSearchModal({ isOpen, seed, onClose }: TopNavSearchModalProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UnifiedSearchResult | null>(() =>
    seed.kind === 'success' ? seed.results : null,
  )
  const [error, setError] = useState<string | null>(() =>
    seed.kind === 'error' ? seed.message : null,
  )
  const [domain, setDomain] = useState<SearchDomain>('stock')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [personFilter, setPersonFilter] = useState<PersonFilter>('all')
  const [fallbackFilter, setFallbackFilter] = useState<FallbackFilter>('all')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const skipNextEmptyFetch = useRef(seed.kind === 'success')

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setStockFilter('all')
    setPersonFilter('all')
    setFallbackFilter('all')

    if (seed.kind === 'success') {
      setResults(seed.results)
      setError(null)
      setLoading(false)
      syncDomainFromResults(seed.results, setDomain)
      skipNextEmptyFetch.current = true
    } else {
      setResults(null)
      setError(seed.message)
      setLoading(false)
      setDomain('stock')
      skipNextEmptyFetch.current = false
    }
  }, [isOpen, seed])

  useEffect(() => {
    if (!isOpen) {
      setLoading(false)
      skipNextEmptyFetch.current = false
      return
    }

    const trimmed = query.trim()
    if (skipNextEmptyFetch.current && !trimmed) {
      skipNextEmptyFetch.current = false
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchUnifiedSearch(trimmed)
        if (!cancelled) {
          setResults(data)
          setError(null)
          syncDomainFromResults(data, setDomain)
        }
      } catch (e) {
        if (!cancelled) {
          setResults(null)
          setError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, trimmed ? 200 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isOpen, query])

  useEffect(() => {
    setStockFilter('all')
    setPersonFilter('all')
    if (!query.trim()) setFallbackFilter('all')
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

  const hasSearchResults = hasStocks || hasPersons
  const fallback = results?.fallback ?? null
  const hasFallback = Boolean(
    fallback &&
      (fallback.stockSectors.length > 0 ||
        fallback.topPersons.length > 0 ||
        fallback.latestNews.length > 0),
  )
  const showFallback = Boolean(
    !loading && !error && results && hasFallback && (!trimmedQuery || !hasSearchResults),
  )
  const showEmptySearchMessage = Boolean(trimmedQuery && results && !hasSearchResults && !loading && !error)
  const showSearchFilters = Boolean(trimmedQuery && results && hasSearchResults)
  const contentReady = results !== null || Boolean(error)
  const showError = Boolean(error && !loading)

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
      <section className={styles.searchSection} aria-label="통합 검색">
        <div className={clsx(styles.inputRow, query && styles.inputRowHasClear)}>
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

        {contentReady ? (
          <>
            {showDomainTabs && showSearchFilters ? (
              <div className={styles.tabNavStrip}>
                <UnderlineTabNav
                  ariaLabel="검색 범주"
                  options={domainOptions}
                  value={domain}
                  onChange={setDomain}
                />
              </div>
            ) : null}

            {showSearchFilters ? (
              <div className={styles.tabNavStrip}>
                <UnderlineTabNav
                  ariaLabel="검색 결과 필터"
                  options={effectiveDomain === 'stock' ? STOCK_FILTERS : PERSON_FILTERS}
                  value={effectiveDomain === 'stock' ? stockFilter : personFilter}
                  onChange={(key) => {
                    if (effectiveDomain === 'stock') setStockFilter(key as StockFilter)
                    else setPersonFilter(key as PersonFilter)
                  }}
                />
              </div>
            ) : null}

            {showFallback ? (
              <div className={styles.tabNavStrip}>
                <UnderlineTabNav
                  ariaLabel="추천 콘텐츠 필터"
                  options={FALLBACK_FILTERS}
                  value={fallbackFilter}
                  onChange={setFallbackFilter}
                />
              </div>
            ) : null}

            <div className={styles.scrollBody}>
              {showEmptySearchMessage ? (
                <p className={styles.emptyHint}>검색 결과가 없습니다.</p>
              ) : null}

              {showSearchFilters && effectiveDomain === 'stock' ? (
                <StockSearchResults
                  stocks={stocks}
                  stockNewsFlat={stockNewsFlat}
                  filter={stockFilter}
                  onClose={onClose}
                />
              ) : null}

              {showSearchFilters && effectiveDomain === 'person' ? (
                <PersonSearchResults
                  persons={persons}
                  personNewsFlat={personNewsFlat}
                  personStatementsFlat={personStatementsFlat}
                  filter={personFilter}
                  onClose={onClose}
                />
              ) : null}

              {showFallback && fallback ? (
                <SearchFallbackResults
                  fallback={fallback}
                  filter={fallbackFilter}
                  onClose={onClose}
                />
              ) : null}

              {!showFallback && !showSearchFilters && trimmedQuery ? (
                <p className={styles.empty}>검색 결과가 없습니다.</p>
              ) : null}
            </div>
          </>
        ) : null}

        {showError ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.footerHints}>
          <span>/ 검색</span>
          <span>관심목록 즉시 반영</span>
          <span>ESC 모달 닫기</span>
        </div>
      </section>
    </Modal>
  )
}
