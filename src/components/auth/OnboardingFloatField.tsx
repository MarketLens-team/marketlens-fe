import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { fetchStockOverview } from '../../data/clients/stockClient'
import type { StockOverviewRow } from '../../data/types/stock'
import { formatPercent } from '../stock/stockScore'
import { EntityAvatar } from '../ui/EntityAvatar'
import styles from './OnboardingFloatField.module.css'

const FLOAT_COUNT = 9

type FloatAnchor = 'start' | 'center' | 'end'

interface FloatPlacement {
  left: number
  top: number
  sizeRem: number
  delayS: number
  durationS: number
}

interface FloatStock extends StockOverviewRow, FloatPlacement {
  anchor: FloatAnchor
}

interface OnboardingFloatFieldProps {
  /** 카드 DOM — 가림 판정용 */
  occluderRef: RefObject<HTMLElement | null>
}

/** 카드 중앙 밴드(%) — float는 좌·우 여백에만 배치 */
const CARD_BAND_LEFT_MAX = 32
const CARD_BAND_RIGHT_MIN = 68
const LEFT_ZONE = { min: 5, max: 28 } as const
const RIGHT_ZONE = { min: 72, max: 95 } as const
const TOP_RANGE = { min: 8, max: 90 } as const
const MIN_PLACEMENT_DIST_PCT = 14

/** 카드 안쪽으로 이 정도 들어오면 호버 비활성 (아바타 중심 기준) */
const OCCLUDER_INSET_PX = 6

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function placementDistance(a: FloatPlacement, b: FloatPlacement): number {
  return Math.hypot(a.left - b.left, a.top - b.top)
}

function isInSideMargin(left: number): boolean {
  return left <= CARD_BAND_LEFT_MAX || left >= CARD_BAND_RIGHT_MIN
}

function generateRandomPlacements(count: number): FloatPlacement[] {
  const placements: FloatPlacement[] = []
  const sides = shuffle([
    ...Array(Math.ceil(count / 2)).fill('left' as const),
    ...Array(Math.floor(count / 2)).fill('right' as const),
  ])

  for (let i = 0; i < count; i += 1) {
    let placed = false
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const zone = sides[i] === 'left' ? LEFT_ZONE : RIGHT_ZONE
      const candidate: FloatPlacement = {
        left: Math.round(randomBetween(zone.min, zone.max) * 10) / 10,
        top: Math.round(randomBetween(TOP_RANGE.min, TOP_RANGE.max) * 10) / 10,
        sizeRem: Math.round(randomBetween(2.5, 3.85) * 100) / 100,
        delayS: Math.round(randomBetween(0, 5) * 10) / 10,
        durationS: Math.round(randomBetween(26, 34)),
      }

      if (!isInSideMargin(candidate.left)) continue
      if (placements.some((p) => placementDistance(p, candidate) < MIN_PLACEMENT_DIST_PCT)) continue

      placements.push(candidate)
      placed = true
      break
    }

    if (!placed) {
      const fallbackSide = i % 2 === 0 ? LEFT_ZONE : RIGHT_ZONE
      placements.push({
        left: randomBetween(fallbackSide.min, fallbackSide.max),
        top: randomBetween(TOP_RANGE.min, TOP_RANGE.max),
        sizeRem: 3,
        delayS: i * 0.6,
        durationS: 28 + (i % 5),
      })
    }
  }

  return placements
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function resolveAnchor(left: number): FloatAnchor {
  if (left <= CARD_BAND_LEFT_MAX) return 'start'
  if (left >= CARD_BAND_RIGHT_MIN) return 'end'
  return 'center'
}

function pickFloatStocks(rows: StockOverviewRow[]): FloatStock[] {
  if (rows.length === 0) return []
  const placements = generateRandomPlacements(FLOAT_COUNT)
  return shuffle(rows)
    .slice(0, FLOAT_COUNT)
    .map((stock, index) => {
      const placement = placements[index]
      const anchor = resolveAnchor(placement.left)
      return {
        ...stock,
        ...placement,
        anchor,
      }
    })
}

function isAvatarCenterOutsideCard(avatarRect: DOMRect, occluderRect: DOMRect): boolean {
  const cx = avatarRect.left + avatarRect.width / 2
  const cy = avatarRect.top + avatarRect.height / 2
  const inset = OCCLUDER_INSET_PX
  return (
    cx < occluderRect.left + inset ||
    cx > occluderRect.right - inset ||
    cy < occluderRect.top + inset ||
    cy > occluderRect.bottom - inset
  )
}

function resolveDetailExpandLeft(avatarRect: DOMRect, occluderRect: DOMRect): boolean {
  const cx = avatarRect.left + avatarRect.width / 2
  const cardMidX = (occluderRect.left + occluderRect.right) / 2
  return cx < cardMidX
}

const ANCHOR_CLASS: Record<FloatAnchor, string> = {
  start: styles.floatAnchorStart,
  center: styles.floatAnchorCenter,
  end: styles.floatAnchorEnd,
}

const DRIFT_CLASS: Record<FloatAnchor, string> = {
  start: styles.driftStart,
  center: styles.driftCenter,
  end: styles.driftEnd,
}

export function OnboardingFloatField({ occluderRef }: OnboardingFloatFieldProps) {
  const [stocks, setStocks] = useState<FloatStock[]>([])
  const [hoverableCodes, setHoverableCodes] = useState<Set<string>>(() => new Set())
  const [detailExpandLeft, setDetailExpandLeft] = useState<Record<string, boolean>>({})

  const fieldRef = useRef<HTMLDivElement>(null)
  const floatRefs = useRef(new Map<string, HTMLDivElement>())

  const measureHoverable = useCallback(() => {
    const field = fieldRef.current
    const occluder = occluderRef.current
    if (!field || !occluder || stocks.length === 0) {
      setHoverableCodes(new Set())
      return
    }

    const occluderRect = occluder.getBoundingClientRect()
    const next = new Set<string>()
    const nextExpandLeft: Record<string, boolean> = {}

    for (const stock of stocks) {
      const node = floatRefs.current.get(stock.code)
      if (!node) continue

      const avatar = node.getElementsByClassName(styles.avatar)[0] as HTMLElement | undefined
      const avatarRect = (avatar ?? node).getBoundingClientRect()

      nextExpandLeft[stock.code] = resolveDetailExpandLeft(avatarRect, occluderRect)

      if (isAvatarCenterOutsideCard(avatarRect, occluderRect)) {
        next.add(stock.code)
      }
    }

    setHoverableCodes(next)
    setDetailExpandLeft(nextExpandLeft)
  }, [occluderRef, stocks])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchStockOverview()
        if (!cancelled) setStocks(pickFloatStocks(data.stocks))
      } catch {
        if (!cancelled) setStocks([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    if (stocks.length === 0) return undefined

    measureHoverable()

    const field = fieldRef.current
    const occluder = occluderRef.current
    const run = () => requestAnimationFrame(measureHoverable)
    const observer = new ResizeObserver(run)
    if (field) observer.observe(field)
    if (occluder) observer.observe(occluder)
    window.addEventListener('resize', run)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', run)
    }
  }, [measureHoverable, occluderRef, stocks])

  if (stocks.length === 0) return null

  return (
    <div ref={fieldRef} className={styles.field} aria-hidden>
      {stocks.map((stock) => {
        const canHover = hoverableCodes.has(stock.code)
        const expandLeft = detailExpandLeft[stock.code] ?? stock.anchor === 'start'
        const priceUp = stock.changePercent > 0
        const priceDown = stock.changePercent < 0
        const changeClass = priceUp
          ? styles.changeUp
          : priceDown
            ? styles.changeDown
            : styles.changeFlat

        return (
          <div
            key={stock.code}
            ref={(node) => {
              if (node) floatRefs.current.set(stock.code, node)
              else floatRefs.current.delete(stock.code)
            }}
            className={clsx(styles.float, ANCHOR_CLASS[stock.anchor], DRIFT_CLASS[stock.anchor])}
            style={
              {
                left: `${stock.left}%`,
                top: `${stock.top}%`,
                '--float-size': `${stock.sizeRem}rem`,
                '--float-delay': `${stock.delayS}s`,
                '--float-duration': `${stock.durationS}s`,
              } as CSSProperties
            }
          >
            <div
              data-float-hit
              className={clsx(
                styles.hitTarget,
                !canHover && styles.hitTargetNoHover,
              )}
            >
              <EntityAvatar
                variant="stock"
                size="md"
                name={stock.name}
                imageUrl={stock.imageUrl}
                className={styles.avatar}
              />
              <div className={clsx(styles.detail, expandLeft && styles.detailExpandLeft)}>
                <span className={styles.name}>{stock.name}</span>
                <span className={changeClass}>
                  {priceUp ? '▲ ' : priceDown ? '▼ ' : ''}
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
