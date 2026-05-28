import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
import { buildPersonDetailPath } from '../../lib/buildPersonRoute'
import {
  formatSearchNewsStockLabel,
  resolveSearchNewsRoute,
  resolveSearchNewsStockRoute,
  type SearchNewsStockContext,
} from '../../lib/resolveSearchNewsRoute'
import { useServerWatchlist } from '../../hooks/useServerWatchlist'
import { formatStockScore, stockSentimentTone } from '../stock/stockScore'
import { StockWatchlistStarButton } from '../stock/StockWatchlistStarButton'
import { EntityAvatar } from '../ui/EntityAvatar'
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
type PersonFilter = 'all' | 'person' | 'statement'
type FallbackFilter = 'all' | 'stock' | 'person' | 'news'

const FALLBACK_FILTERS: { key: FallbackFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'stock', label: '종목' },
  { key: 'person', label: '인물' },
  { key: 'news', label: '뉴스' },
]

const SEARCH_NAV_ITEM = 'data-search-nav-item'
const SEARCH_NAV_PRIMARY = 'data-search-nav-primary'
const SEARCH_NAV_SELECTED = 'data-search-nav-selected'

function cycleTabOption<T extends string>(
  options: { key: T }[],
  current: T,
  delta: -1 | 1,
): T {
  if (options.length === 0) return current
  const idx = options.findIndex((option) => option.key === current)
  const base = idx < 0 ? 0 : idx
  const next = (base + delta + options.length) % options.length
  return options[next].key
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function formatNewsMeta(iso: string) {
  return `${formatNewsDateLong(iso)} · ${formatNewsTimeBadge(iso)}`
}

function formatMentionCount(count: number) {
  return `언급 ${count.toLocaleString('ko-KR')}`
}

type NewsWithContext = SearchNewsPreview & { stockLabel?: string; rowKey: string }

function searchNewsSentimentClass(score: number) {
  const tone = stockSentimentTone(score)
  if (tone === 'positive') return styles.newsSentimentPos
  if (tone === 'negative') return styles.newsSentimentNeg
  return styles.newsSentimentWarn
}

function mapSearchNewsRows(
  news: SearchNewsPreview[],
  keyPrefix = 'news',
  singleStock?: SearchNewsStockContext | null,
): NewsWithContext[] {
  return news.map((item) => ({
    ...item,
    stockLabel: formatSearchNewsStockLabel(item, singleStock),
    rowKey: `${keyPrefix}-${item.id}`,
  }))
}

type StatementWithContext = SearchStatementPreview & {
  personId: string
  personName: string
  rowKey: string
}

function flattenPersonStatements(persons: SearchPersonResult[]): StatementWithContext[] {
  const rows: StatementWithContext[] = []
  for (const person of persons) {
    for (const item of person.relatedStatements) {
      rows.push({
        ...item,
        personId: person.personId,
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
  imageUrl?: string | null
  market?: string
  sectorCode?: string
  sectorName?: string
  mentionCount?: number
}

type SearchStockWatchlist = Pick<
  ReturnType<typeof useServerWatchlist>,
  'has' | 'toggle' | 'pendingCode'
>

function StockSearchRow({
  stock,
  onClose,
  showMentionCount,
  watchlist,
}: {
  stock: StockSearchRowModel
  onClose: () => void
  showMentionCount?: boolean
  watchlist: SearchStockWatchlist
}) {
  const navigate = useNavigate()
  const interested = watchlist.has(stock.code)
  const watchlistPending = watchlist.pendingCode === stock.code

  return (
    <li data-search-nav-item>
      <button
        type="button"
        data-search-nav-primary
        className={clsx(
          styles.searchRowBtn,
          showMentionCount ? styles.searchRowStockWithStat : styles.searchRowStock,
        )}
        onClick={() => {
          navigate(`/stock/${stock.code}`)
          onClose()
        }}
      >
        <StockWatchlistStarButton
          interested={interested}
          pending={watchlistPending}
          onToggle={() => {
            void watchlist.toggle({
              code: stock.code,
              name: stock.name,
              imageUrl: stock.imageUrl,
            })
          }}
        />
        <div className={styles.stockIdentity}>
          <EntityAvatar variant="stock" size="md" name={stock.name} imageUrl={stock.imageUrl} />
          <div className={styles.stockIdentityText}>
            <p className={styles.stockName}>{stock.name}</p>
            <p className={styles.stockMeta}>
              {stock.code}
              {stock.market ? ` · ${stock.market}` : ''}
            </p>
          </div>
        </div>
        {showMentionCount && stock.mentionCount != null ? (
          <p className={styles.searchRowStat}>{formatMentionCount(stock.mentionCount)}</p>
        ) : null}
      </button>
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
  const watchlist = useServerWatchlist()
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
                watchlist={watchlist}
              />
            ))}
          </ul>
        </ResultSection>
      ))}
    </>
  )
}

function SearchNewsRows({
  items,
  onClose,
  singleStock,
}: {
  items: NewsWithContext[]
  onClose: () => void
  singleStock?: SearchNewsStockContext | null
}) {
  const navigate = useNavigate()

  if (items.length === 0) return null

  return (
    <ul className={styles.rowList}>
      {items.map((item) => {
        const inAppRoute = resolveSearchNewsRoute(item, singleStock)
        const stockRoute = resolveSearchNewsStockRoute(item, singleStock)
        const inner = (
          <SearchNewsRowContent
            item={item}
            singleStock={singleStock}
            onStockClick={
              stockRoute
                ? () => {
                    navigate(stockRoute)
                    onClose()
                  }
                : undefined
            }
          />
        )

        if (inAppRoute) {
          return (
            <li key={item.rowKey} data-search-nav-item>
              <button
                type="button"
                data-search-nav-primary
                className={styles.newsRowCard}
                onClick={() => {
                  navigate(inAppRoute)
                  onClose()
                }}
              >
                {inner}
              </button>
            </li>
          )
        }

        return (
          <li key={item.rowKey} data-search-nav-item={item.url ? true : undefined}>
            {item.url ? (
              <a
                data-search-nav-primary
                className={styles.newsRowCard}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div className={styles.newsRowCard}>{inner}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SearchNewsRowContent({
  item,
  onStockClick,
  singleStock,
}: {
  item: NewsWithContext
  onStockClick?: () => void
  singleStock?: SearchNewsStockContext | null
}) {
  const stockLabel = item.stockLabel ?? formatSearchNewsStockLabel(item, singleStock)

  return (
    <>
      <div className={styles.newsText}>
        {stockLabel && onStockClick ? (
          <span
            role="link"
            tabIndex={-1}
            className={styles.newsStockLabelBtn}
            onClick={(e) => {
              e.stopPropagation()
              onStockClick()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                e.preventDefault()
                onStockClick()
              }
            }}
          >
            {stockLabel}
          </span>
        ) : stockLabel ? (
          <p className={styles.newsStockLabel}>{stockLabel}</p>
        ) : null}
        <p className={styles.newsTitle}>{item.title}</p>
        <p className={styles.newsMeta}>
          {item.source} · {formatNewsMeta(item.publishedAt)} ·{' '}
          <span className={clsx(styles.newsSentiment, searchNewsSentimentClass(item.sentimentScore))}>
            {formatStockScore(item.sentimentScore)}
          </span>
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

type PersonRowModel = {
  personId: string
  personName: string
  imageUrl?: string | null
  organizationName: string
  role: string
  mentionCount?: number
}

function PersonSearchRow({
  person,
  onClose,
}: {
  person: PersonRowModel
  onClose: () => void
}) {
  const navigate = useNavigate()
  const showMentionStat = person.mentionCount != null

  return (
    <li
      data-search-nav-item
      className={clsx(
        styles.searchRow,
        showMentionStat ? styles.searchRowWithStat : styles.searchRowTwoCol,
      )}
    >
      <div className={styles.stockIdentity}>
        <EntityAvatar variant="person" size="md" name={person.personName} imageUrl={person.imageUrl} />
        <div className={styles.stockIdentityText}>
        <p className={styles.personName}>{person.personName}</p>
        <p className={styles.personMeta}>
          {person.organizationName}
          {person.role ? ` · ${person.role}` : ''}
        </p>
        </div>
      </div>
      {showMentionStat ? (
        <p className={styles.searchRowStat}>{formatMentionCount(person.mentionCount!)}</p>
      ) : null}
      <div className={styles.stockActions}>
        <button
          type="button"
          data-search-nav-primary
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
  )
}

function PersonResultList({
  persons,
  onClose,
}: {
  persons: SearchPersonResult[]
  onClose: () => void
}) {
  return (
    <ul className={styles.rowList}>
      {persons.map((person) => (
        <PersonSearchRow key={person.personId} person={person} onClose={onClose} />
      ))}
    </ul>
  )
}

function StatementRows({
  items,
  onClose,
}: {
  items: StatementWithContext[]
  onClose: () => void
}) {
  const navigate = useNavigate()

  if (items.length === 0) return null

  return (
    <ul className={styles.rowList}>
      {items.map((stmt) => (
        <li key={stmt.rowKey} data-search-nav-item>
          <button
            type="button"
            data-search-nav-primary
            className={styles.statementRowCard}
            onClick={() => {
              navigate(buildPersonDetailPath(stmt.personId, { statementId: stmt.id }))
              onClose()
            }}
          >
            <p className={styles.statementQuote}>{stmt.quote}</p>
            <p className={styles.statementMeta}>
              <span className={styles.statementPersonName}>{stmt.personName}</span>
              <span aria-hidden> · </span>
              {formatNewsMeta(stmt.publishedAt)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}

function mapPersonStatements(person: SearchPersonResult): StatementWithContext[] {
  return person.relatedStatements.map((item) => ({
    ...item,
    personId: person.personId,
    personName: person.personName,
    rowKey: `stmt-${person.personId}-${item.id}`,
  }))
}

function PersonStatementSections({
  persons,
  onClose,
  sectionLabel = '발언',
}: {
  persons: SearchPersonResult[]
  onClose: () => void
  sectionLabel?: string
}) {
  const withStatements = persons.filter((person) => person.relatedStatements.length > 0)
  if (withStatements.length === 0) return null

  if (withStatements.length === 1) {
    const person = withStatements[0]
    return (
      <ResultSection label={sectionLabel} variant="rows">
        <StatementRows items={mapPersonStatements(person)} onClose={onClose} />
      </ResultSection>
    )
  }

  return (
    <>
      {withStatements.map((person) => (
        <ResultSection key={person.personId} label={person.personName} variant="rows">
          <StatementRows items={mapPersonStatements(person)} onClose={onClose} />
        </ResultSection>
      ))}
    </>
  )
}

function StockSearchResults({
  stocks,
  searchNews,
  filter,
  onClose,
  singleStock,
}: {
  stocks: SearchStockResult[]
  searchNews: NewsWithContext[]
  filter: StockFilter
  onClose: () => void
  singleStock?: SearchNewsStockContext | null
}) {
  if (filter === 'stock') {
    if (stocks.length === 0) return <p className={styles.empty}>종목 결과가 없습니다.</p>
    return <StockResultList stocks={stocks} onClose={onClose} />
  }

  if (filter === 'news') {
    if (searchNews.length === 0) return <p className={styles.empty}>뉴스 결과가 없습니다.</p>
    return (
      <ResultSection label="뉴스" variant="rows">
        <SearchNewsRows items={searchNews} onClose={onClose} singleStock={singleStock} />
      </ResultSection>
    )
  }

  if (stocks.length === 0 && searchNews.length === 0) {
    return <p className={styles.empty}>검색 결과가 없습니다.</p>
  }

  return (
    <>
      {stocks.length > 0 ? <StockResultList stocks={stocks} onClose={onClose} /> : null}
      {searchNews.length > 0 ? (
        <ResultSection label="뉴스" variant="rows">
          <SearchNewsRows items={searchNews} onClose={onClose} singleStock={singleStock} />
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
  return (
    <ul className={styles.rowList}>
      {persons.map((person) => (
        <PersonSearchRow
          key={person.personId}
          person={{ ...person, mentionCount: person.mentionCount }}
          onClose={onClose}
        />
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
  const latestNewsRows = mapSearchNewsRows(fallback.latestNews, 'fallback-news')

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
      <ResultSection label="오늘 화제 인물" variant="rows">
        <FallbackPersonList persons={fallback.topPersons} onClose={onClose} />
      </ResultSection>
    )
  }

  if (filter === 'news') {
    if (fallback.latestNews.length === 0) {
      return <p className={styles.empty}>추천 뉴스가 없습니다.</p>
    }
    return (
      <ResultSection label="최신 뉴스" variant="rows">
        <SearchNewsRows items={latestNewsRows} onClose={onClose} />
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
        <ResultSection label="최신 뉴스" variant="rows">
          <SearchNewsRows items={latestNewsRows} onClose={onClose} />
        </ResultSection>
      ) : null}
    </>
  )
}

function PersonSearchResults({
  persons,
  personStatementsFlat,
  filter,
  onClose,
}: {
  persons: SearchPersonResult[]
  personStatementsFlat: StatementWithContext[]
  filter: PersonFilter
  onClose: () => void
}) {
  if (filter === 'person') {
    if (persons.length === 0) return <p className={styles.empty}>인물 결과가 없습니다.</p>
    return (
      <ResultSection label="인물" variant="rows">
        <PersonResultList persons={persons} onClose={onClose} />
      </ResultSection>
    )
  }

  if (filter === 'statement') {
    if (personStatementsFlat.length === 0) return <p className={styles.empty}>발언 결과가 없습니다.</p>
    return <PersonStatementSections persons={persons} onClose={onClose} />
  }

  if (persons.length === 0 && personStatementsFlat.length === 0) {
    return <p className={styles.empty}>검색 결과가 없습니다.</p>
  }

  return (
    <>
      {persons.length > 0 ? (
        <ResultSection label="인물" variant="rows">
          <PersonResultList persons={persons} onClose={onClose} />
        </ResultSection>
      ) : null}
      <PersonStatementSections persons={persons} onClose={onClose} />
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
  const scrollRegionRef = useRef<HTMLDivElement | null>(null)
  const skipNextEmptyFetch = useRef(seed.kind === 'success')
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1)

  const focusSearchInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const onWheel = (event: WheelEvent) => {
      const region = scrollRegionRef.current
      if (!region) return

      const dialog = region.closest('[role="dialog"]')
      if (!dialog) return

      const overlay = dialog.parentElement
      if (!overlay?.classList.contains('modal-overlay')) return

      const target = event.target
      if (!(target instanceof Node) || !overlay.contains(target)) return
      if (region.contains(target)) return
      if (isEditableTarget(target)) return

      const { scrollTop, scrollHeight, clientHeight } = region
      if (scrollHeight <= clientHeight) return

      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) return

      region.scrollTop += event.deltaY
      event.preventDefault()
    }

    document.addEventListener('wheel', onWheel, { passive: false })
    return () => document.removeEventListener('wheel', onWheel)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setSelectedRowIndex(-1)
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

  const singleStockContext = useMemo((): SearchNewsStockContext | null => {
    if (stocks.length !== 1) return null
    const stock = stocks[0]
    return { stockCode: stock.code, stockName: stock.name }
  }, [stocks])

  const searchNews = useMemo(
    () => mapSearchNewsRows(results?.news ?? [], 'news', singleStockContext),
    [results?.news, singleStockContext],
  )
  const personStatementsFlat = useMemo(() => flattenPersonStatements(persons), [persons])

  const hasStocks = stocks.length > 0
  const hasPersons = persons.length > 0
  const hasNews = searchNews.length > 0
  const hasPersonStatements = personStatementsFlat.length > 0
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

  const hasSearchResults = hasStocks || hasPersons || hasNews || hasPersonStatements

  const stockFilterOptions = useMemo(
    () => [
      { key: 'all' as const, label: '전체' },
      { key: 'stock' as const, label: hasStocks ? `종목 (${stocks.length})` : '종목' },
      { key: 'news' as const, label: hasNews ? `뉴스 (${searchNews.length})` : '뉴스' },
    ],
    [hasStocks, hasNews, stocks.length, searchNews.length],
  )

  const personFilterOptions = useMemo(
    () => [
      { key: 'all' as const, label: '전체' },
      { key: 'person' as const, label: hasPersons ? `인물 (${persons.length})` : '인물' },
      {
        key: 'statement' as const,
        label: hasPersonStatements ? `발언 (${personStatementsFlat.length})` : '발언',
      },
    ],
    [hasPersons, hasPersonStatements, persons.length, personStatementsFlat.length],
  )
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
  const showEmptySearchMessage = Boolean(
    trimmedQuery && results && !hasSearchResults && !loading && !error,
  )
  const showSearchFilters = Boolean(trimmedQuery && results && hasSearchResults)
  const contentReady = results !== null || Boolean(error)
  const showError = Boolean(error && !loading)

  const hasFilterTabs = showFallback || showSearchFilters

  useEffect(() => {
    setSelectedRowIndex(-1)
  }, [
    query,
    stockFilter,
    personFilter,
    fallbackFilter,
    domain,
    effectiveDomain,
    results,
    showFallback,
    showSearchFilters,
    loading,
  ])

  useLayoutEffect(() => {
    const region = scrollRegionRef.current
    if (!region) return
    region.setAttribute('data-search-nav-active', selectedRowIndex >= 0 ? 'true' : 'false')
    const items = region.querySelectorAll(`[${SEARCH_NAV_ITEM}]`)
    items.forEach((element, index) => {
      element.setAttribute(SEARCH_NAV_SELECTED, index === selectedRowIndex ? 'true' : 'false')
    })
    const active = items[selectedRowIndex]
    if (active) {
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedRowIndex, query, stockFilter, personFilter, fallbackFilter, domain, results, loading])

  useEffect(() => {
    const region = scrollRegionRef.current
    if (!region || !isOpen) return

    const syncSelectionFromPointer = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const item = target.closest(`[${SEARCH_NAV_ITEM}]`)
      if (!item || !region.contains(item)) return
      const items = region.querySelectorAll(`[${SEARCH_NAV_ITEM}]`)
      const index = Array.from(items).indexOf(item)
      if (index >= 0) setSelectedRowIndex(index)
    }

    region.addEventListener('pointermove', syncSelectionFromPointer)
    return () => region.removeEventListener('pointermove', syncSelectionFromPointer)
  }, [isOpen, results, stockFilter, personFilter, fallbackFilter, domain, effectiveDomain, showFallback, showSearchFilters])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = scrollRegionRef.current?.closest('[role="dialog"]')
      if (!dialog) return

      if (event.code === 'KeyP' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.target === inputRef.current) return
        if (isEditableTarget(event.target)) return
        event.preventDefault()
        focusSearchInput()
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (!hasFilterTabs) return
        event.preventDefault()
        const delta: -1 | 1 = event.key === 'ArrowRight' ? 1 : -1
        if (showFallback) {
          setFallbackFilter((prev) => cycleTabOption(FALLBACK_FILTERS, prev, delta))
        } else if (showSearchFilters) {
          if (effectiveDomain === 'stock') {
            setStockFilter((prev) => cycleTabOption(stockFilterOptions, prev, delta))
          } else {
            setPersonFilter((prev) => cycleTabOption(personFilterOptions, prev, delta))
          }
        }
        return
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return

      const items = scrollRegionRef.current?.querySelectorAll(`[${SEARCH_NAV_ITEM}]`)
      const itemCount = items?.length ?? 0

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (itemCount === 0) return
        event.preventDefault()
        const scrollRegion = scrollRegionRef.current
        const activeEl = document.activeElement
        if (
          scrollRegion &&
          activeEl instanceof HTMLElement &&
          activeEl !== inputRef.current &&
          scrollRegion.contains(activeEl)
        ) {
          activeEl.blur()
        }
        setSelectedRowIndex((prev) => {
          if (event.key === 'ArrowDown') {
            if (prev < 0) return 0
            return Math.min(prev + 1, itemCount - 1)
          }
          if (prev <= 0) {
            window.requestAnimationFrame(() => focusSearchInput())
            return -1
          }
          return prev - 1
        })
        return
      }

      if (event.key === 'Enter' && selectedRowIndex >= 0 && itemCount > 0) {
        event.preventDefault()
        const row = items?.[selectedRowIndex]
        const primary = row?.querySelector(`[${SEARCH_NAV_PRIMARY}]`) as HTMLElement | null
        primary?.click()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [
    isOpen,
    focusSearchInput,
    hasFilterTabs,
    showFallback,
    showSearchFilters,
    effectiveDomain,
    stockFilterOptions,
    personFilterOptions,
    selectedRowIndex,
  ])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnEsc
      closeOnOverlay
      contentClassOnly
      overlayClassName={styles.searchOverlay}
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
            aria-keyshortcuts="p"
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
          <div className={styles.resultsPanel}>
            <div className={styles.filterChrome}>
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
                    options={effectiveDomain === 'stock' ? stockFilterOptions : personFilterOptions}
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
            </div>

            <div ref={scrollRegionRef} className={styles.scrollRegion}>
            <div className={styles.scrollBody}>
              {showEmptySearchMessage ? (
                <p className={styles.emptyHint}>검색 결과가 없습니다.</p>
              ) : null}

              {showSearchFilters && effectiveDomain === 'stock' ? (
                <StockSearchResults
                  stocks={stocks}
                  searchNews={searchNews}
                  filter={stockFilter}
                  onClose={onClose}
                  singleStock={singleStockContext}
                />
              ) : null}

              {showSearchFilters && effectiveDomain === 'person' ? (
                <PersonSearchResults
                  persons={persons}
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
            </div>
          </div>
        ) : null}

        {showError ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.footerHints}>
          <span>p 검색</span>
          <span>ESC 모달 닫기</span>
        </div>
      </section>
    </Modal>
  )
}
