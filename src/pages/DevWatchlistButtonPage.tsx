import clsx from 'clsx'
import { useState } from 'react'
import { PillButton } from '../components/ui/PillButton'
import styles from './DevWatchlistButtonPage.module.css'

function VariantStatus({ interested }: { interested: boolean }) {
  return (
    <p className={styles.status}>
      {interested ? '관심종목 ON — 클릭하면 해제' : '관심종목 OFF — 클릭하면 추가'}
    </p>
  )
}

/** Current — 종목 상세와 동일 (OFF primary / ON secondaryActive) */
function CurrentStyle() {
  const [interested, setInterested] = useState(false)

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>Current — OFF primary · ON secondaryActive</p>
      <div className={styles.row}>
        <PillButton
          variant={interested ? 'secondary' : 'primary'}
          active={interested}
          disableHover
          aria-pressed={interested}
          onClick={() => setInterested((prev) => !prev)}
        >
          {interested ? '★ 관심종목' : '관심종목 추가'}
        </PillButton>
      </div>
      <VariantStatus interested={interested} />
    </div>
  )
}

/** A — 토글 강약 뒤집기 (OFF outline · ON primary) */
function InvertedToggle() {
  const [interested, setInterested] = useState(false)

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>A — OFF outline · ON primary</p>
      <div className={styles.row}>
        <button
          type="button"
          className={clsx(styles.btn, interested ? styles.aOn : styles.aOff)}
          aria-pressed={interested}
          onClick={() => setInterested((prev) => !prev)}
        >
          {interested ? (
            <>
              <span className={styles.starGold} aria-hidden>
                ★
              </span>
              관심종목
            </>
          ) : (
            '관심종목 추가'
          )}
        </button>
      </div>
      <VariantStatus interested={interested} />
    </div>
  )
}

/** B — ON 골드 별 + warning tint (별 버튼과 의미 통일) */
function GoldActive() {
  const [interested, setInterested] = useState(false)

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>B — ON 골드 별 + warning tint</p>
      <div className={styles.row}>
        <button
          type="button"
          className={clsx(styles.btn, interested ? styles.bOn : styles.bOff)}
          aria-pressed={interested}
          onClick={() => setInterested((prev) => !prev)}
        >
          {interested ? (
            <>
              <span className={styles.starGold} aria-hidden>
                ★
              </span>
              관심종목
            </>
          ) : (
            '관심종목 추가'
          )}
        </button>
      </div>
      <VariantStatus interested={interested} />
    </div>
  )
}

/** C — 별 토글 + 텍스트 (StockWatchlistStarButton 조합) */
function StarWithLabel() {
  const [interested, setInterested] = useState(false)

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>C (추천) — 별 토글 + 텍스트 (리스트·검색과 동일 별)</p>
      <div className={styles.row}>
        <button
          type="button"
          className={clsx(styles.cButton, interested && styles.cButtonActive)}
          aria-pressed={interested}
          onClick={() => setInterested((prev) => !prev)}
        >
          <span className={styles.cStarBox} aria-hidden>
            {interested ? '★' : '☆'}
          </span>
          <span className={styles.cLabel}>{interested ? '관심종목' : '관심종목 추가'}</span>
        </button>
      </div>
      <VariantStatus interested={interested} />
    </div>
  )
}

/** D — ON ghost + 골드 별 (배경 최소) */
function GhostGold() {
  const [interested, setInterested] = useState(false)

  return (
    <div className={styles.variantWrap}>
      <p className={styles.variantLabel}>D — ON ghost + 골드 별 (배경 없음)</p>
      <div className={styles.row}>
        <button
          type="button"
          className={clsx(styles.btn, interested ? styles.dOn : styles.dOff)}
          aria-pressed={interested}
          onClick={() => setInterested((prev) => !prev)}
        >
          {interested ? (
            <>
              <span className={styles.starGold} aria-hidden>
                ★
              </span>
              관심종목
            </>
          ) : (
            '관심종목 추가'
          )}
        </button>
      </div>
      <VariantStatus interested={interested} />
    </div>
  )
}

export default function DevWatchlistButtonPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>관심종목 버튼 스타일 비교</h1>
      <p className={styles.desc}>
        종목 상세 헤더 관심종목 토글 — 버튼 클릭해서 ON/OFF 상태 확인. 별(☆/★)은
        StockWatchlistStarButton과 동일하게 골드(`--color-warning`) 기준.
      </p>
      <div className={styles.grid}>
        <StarWithLabel />
        <CurrentStyle />
        <InvertedToggle />
        <GoldActive />
        <GhostGold />
      </div>
    </div>
  )
}
