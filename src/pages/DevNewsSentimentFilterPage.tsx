import clsx from 'clsx'
import { useState } from 'react'
import styles from './DevNewsSentimentFilterPage.module.css'

type SentimentFilter = 'all' | 'positive' | 'negative'

const FILTER_LABEL: Record<SentimentFilter, string> = {
  all: '전체',
  positive: '긍정',
  negative: '부정',
}

function SegmentedVariant() {
  const [value, setValue] = useState<SentimentFilter>('positive')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>버전 1 — Segmented Control (추천)</p>
      <p className={styles.variantDesc}>하나로 붙인 세그먼트. 선택된 칩만 면 채움.</p>
      <div className={styles.v1Track} role="group" aria-label="뉴스 감성 필터 세그먼트">
        <button
          type="button"
          className={clsx(styles.v1Btn, value === 'all' && styles.v1AllActive)}
          aria-pressed={value === 'all'}
          onClick={() => setValue('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={clsx(styles.v1Btn, styles.v1Positive, value === 'positive' && styles.v1PositiveActive)}
          aria-pressed={value === 'positive'}
          onClick={() => setValue('positive')}
        >
          <span className={styles.mark} aria-hidden>
            +
          </span>
          긍정
        </button>
        <button
          type="button"
          className={clsx(styles.v1Btn, styles.v1Negative, value === 'negative' && styles.v1NegativeActive)}
          aria-pressed={value === 'negative'}
          onClick={() => setValue('negative')}
        >
          <span className={styles.mark} aria-hidden>
            −
          </span>
          부정
        </button>
      </div>
      <p className={styles.selectedMeta}>
        선택: <strong>{FILTER_LABEL[value]}</strong>
      </p>
    </section>
  )
}

function SolidVariant() {
  const [value, setValue] = useState<SentimentFilter>('positive')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>버전 2 — 개별 버튼 + 강한 색감</p>
      <p className={styles.variantDesc}>긍정/부정 그라데이션 면. 선택 시 링 강조.</p>
      <div className={styles.v2Row} role="group" aria-label="뉴스 감성 필터 솔리드">
        <button
          type="button"
          className={clsx(styles.v2Btn, styles.v2All, value === 'all' && styles.v2Selected)}
          aria-pressed={value === 'all'}
          onClick={() => setValue('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={clsx(styles.v2Btn, styles.v2Positive, value === 'positive' && styles.v2Selected)}
          aria-pressed={value === 'positive'}
          onClick={() => setValue('positive')}
        >
          <span className={styles.v2Emoji} aria-hidden>
            👍
          </span>
          <span>+ 긍정</span>
        </button>
        <button
          type="button"
          className={clsx(styles.v2Btn, styles.v2Negative, value === 'negative' && styles.v2Selected)}
          aria-pressed={value === 'negative'}
          onClick={() => setValue('negative')}
        >
          <span className={styles.v2Emoji} aria-hidden>
            👎
          </span>
          <span>− 부정</span>
        </button>
      </div>
      <p className={styles.selectedMeta}>
        선택: <strong>{FILTER_LABEL[value]}</strong>
      </p>
    </section>
  )
}

function BorderVariant() {
  const [value, setValue] = useState<SentimentFilter>('positive')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>버전 3 — 미니멀 + 색상 테두리</p>
      <p className={styles.variantDesc}>면 없이 테두리·텍스트 색으로 감성 구분.</p>
      <div className={styles.v3Row} role="group" aria-label="뉴스 감성 필터 보더">
        <button
          type="button"
          className={clsx(styles.v3Btn, styles.v3All, value === 'all' && styles.v3AllActive)}
          aria-pressed={value === 'all'}
          onClick={() => setValue('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={clsx(styles.v3Btn, styles.v3Positive, value === 'positive' && styles.v3PositiveActive)}
          aria-pressed={value === 'positive'}
          onClick={() => setValue('positive')}
        >
          + 긍정
        </button>
        <button
          type="button"
          className={clsx(styles.v3Btn, styles.v3Negative, value === 'negative' && styles.v3NegativeActive)}
          aria-pressed={value === 'negative'}
          onClick={() => setValue('negative')}
        >
          − 부정
        </button>
      </div>
      <p className={styles.selectedMeta}>
        선택: <strong>{FILTER_LABEL[value]}</strong>
      </p>
    </section>
  )
}

function UnderlineMypageVariant() {
  const [value, setValue] = useState<SentimentFilter>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>버전 4 — 마이페이지 언더라인 (북마크 정렬 탭)</p>
      <p className={styles.variantDesc}>
        구분선 위 탭 + 하단 보더. 마이페이지 「최신순 / 오래된순」과 동일 패턴.
      </p>
      <div className={styles.mockPanel}>
        <h3 className={styles.mockPanelTitle}>관련 뉴스</h3>
        <div className={styles.v4SortBar} role="tablist" aria-label="뉴스 감성 필터">
          <button
            type="button"
            role="tab"
            aria-selected={value === 'all'}
            className={clsx(styles.v4Tab, value === 'all' && styles.v4TabAllActive)}
            onClick={() => setValue('all')}
          >
            전체
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={value === 'positive'}
            className={clsx(
              styles.v4Tab,
              styles.v4TabPositive,
              value === 'positive' && styles.v4TabPositiveActive,
            )}
            onClick={() => setValue('positive')}
          >
            긍정
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={value === 'negative'}
            className={clsx(
              styles.v4Tab,
              styles.v4TabNegative,
              value === 'negative' && styles.v4TabNegativeActive,
            )}
            onClick={() => setValue('negative')}
          >
            부정
          </button>
        </div>
        <ul className={styles.mockNewsList} aria-hidden>
          <li className={styles.mockNewsItem}>
            <span className={styles.mockNewsTitle}>뉴스 제목 플레이스홀더</span>
            <span className={styles.mockNewsMeta}>06.10 · 출처</span>
          </li>
          <li className={styles.mockNewsItem}>
            <span className={styles.mockNewsTitle}>필터 아래 구분선 이후 목록</span>
            <span className={styles.mockNewsMeta}>06.09 · 출처</span>
          </li>
        </ul>
      </div>
      <p className={styles.selectedMeta}>
        선택: <strong>{FILTER_LABEL[value]}</strong>
      </p>
    </section>
  )
}

function CurrentVariant() {
  const [value, setValue] = useState<SentimentFilter>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Current — 종목 상세 (PillButton secondary)</p>
      <p className={styles.variantDesc}>프로덕션 현재 스타일. 비교용.</p>
      <div className={styles.currentRow} role="group" aria-label="뉴스 감성 필터 현재">
        {(['all', 'positive', 'negative'] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={clsx(styles.currentChip, value === key && styles.currentChipActive)}
            aria-pressed={value === key}
            onClick={() => setValue(key)}
          >
            {FILTER_LABEL[key]}
          </button>
        ))}
      </div>
      <p className={styles.selectedMeta}>
        선택: <strong>{FILTER_LABEL[value]}</strong>
      </p>
    </section>
  )
}

export default function DevNewsSentimentFilterPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>뉴스 감성 필터 UI 비교</h1>
      <p className={styles.desc}>
        종목 상세 「관련 뉴스」 긍정/부정 필터 시안입니다. 클릭해 선택 상태를 확인하세요.
      </p>
      <div className={styles.grid}>
        <CurrentVariant />
        <UnderlineMypageVariant />
        <SegmentedVariant />
        <SolidVariant />
        <BorderVariant />
      </div>
    </main>
  )
}
