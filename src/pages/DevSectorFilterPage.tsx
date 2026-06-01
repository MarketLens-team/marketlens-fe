import clsx from 'clsx'
import { useState } from 'react'
import styles from './DevSectorFilterPage.module.css'

const SECTORS = ['all', '2차전지', '금융', '바이오/제약', '반도체', '에너지/정유', '자동차', '철강/소재', 'IT/플랫폼'] as const

type SectorKey = (typeof SECTORS)[number]

function labelOf(sector: SectorKey) {
  return sector === 'all' ? '전체 섹터' : sector
}

function CurrentVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Current - 기존 섹터칩</p>
      <div className={styles.row} role="group" aria-label="섹터 필터 현재 스타일">
        {SECTORS.map((sector) => (
          <button
            key={sector}
            type="button"
            className={clsx(styles.currentChip, selected === sector && styles.currentChipActive)}
            onClick={() => setSelected(sector)}
          >
            {labelOf(sector)}
          </button>
        ))}
      </div>
    </section>
  )
}

function MinimalUnderlineVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>A - 미니멀 언더라인</p>
      <div className={styles.row} role="group" aria-label="섹터 필터 미니멀 스타일">
        {SECTORS.map((sector) => (
          <button
            key={sector}
            type="button"
            className={clsx(styles.minimalChip, selected === sector && styles.minimalChipActive)}
            onClick={() => setSelected(sector)}
          >
            {labelOf(sector)}
          </button>
        ))}
      </div>
    </section>
  )
}

function SolidPrimaryVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>B - 선택값 솔리드 강조</p>
      <div className={styles.row} role="group" aria-label="섹터 필터 솔리드 스타일">
        {SECTORS.map((sector) => (
          <button
            key={sector}
            type="button"
            className={clsx(styles.solidChip, selected === sector && styles.solidChipActive)}
            onClick={() => setSelected(sector)}
          >
            {labelOf(sector)}
          </button>
        ))}
      </div>
    </section>
  )
}

function GhostContrastVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>C - 고스트 대비 강화</p>
      <div className={styles.row} role="group" aria-label="섹터 필터 고스트 스타일">
        {SECTORS.map((sector) => (
          <button
            key={sector}
            type="button"
            className={clsx(styles.ghostChip, selected === sector && styles.ghostChipActive)}
            onClick={() => setSelected(sector)}
          >
            {labelOf(sector)}
          </button>
        ))}
      </div>
    </section>
  )
}

function DropdownVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Dropdown - 섹터 선택</p>
      <div className={styles.dropdownRow}>
        <label htmlFor="sector-dropdown" className={styles.dropdownLabel}>
          섹터
        </label>
        <div className={styles.selectWrap}>
          <select
            id="sector-dropdown"
            className={styles.select}
            value={selected}
            onChange={(event) => setSelected(event.target.value as SectorKey)}
          >
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {labelOf(sector)}
              </option>
            ))}
          </select>
          <span className={styles.selectChevron} aria-hidden>
            ▾
          </span>
        </div>
      </div>
      <p className={styles.selectedMeta}>
        현재 선택: <strong>{labelOf(selected)}</strong>
      </p>
    </section>
  )
}

function CompactDropdownVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Dropdown (Compact) - 보조 툴바 톤</p>
      <div className={styles.selectWrapCompact}>
        <select
          className={styles.selectCompact}
          value={selected}
          onChange={(event) => setSelected(event.target.value as SectorKey)}
          aria-label="섹터 선택 컴팩트"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {labelOf(sector)}
            </option>
          ))}
        </select>
        <span className={styles.selectChevronCompact} aria-hidden>
          ▾
        </span>
      </div>
      <p className={styles.selectedMeta}>
        현재 선택: <strong>{labelOf(selected)}</strong>
      </p>
    </section>
  )
}

function SoftGrayDropdownVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Dropdown (Soft Gray) - 연회색 기본형</p>
      <div className={styles.selectWrapSoft}>
        <select
          className={styles.selectSoft}
          value={selected}
          onChange={(event) => setSelected(event.target.value as SectorKey)}
          aria-label="섹터 선택 소프트 그레이"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {labelOf(sector)}
            </option>
          ))}
        </select>
        <span className={styles.selectChevronSoft} aria-hidden>
          ▾
        </span>
      </div>
      <p className={styles.selectedMeta}>
        현재 선택: <strong>{labelOf(selected)}</strong>
      </p>
    </section>
  )
}

function SoftGrayInsetDropdownVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Dropdown (Inset Gray) - 안쪽 음영형</p>
      <div className={styles.selectWrapInset}>
        <select
          className={styles.selectInset}
          value={selected}
          onChange={(event) => setSelected(event.target.value as SectorKey)}
          aria-label="섹터 선택 인셋 그레이"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {labelOf(sector)}
            </option>
          ))}
        </select>
        <span className={styles.selectChevronInset} aria-hidden>
          ▾
        </span>
      </div>
      <p className={styles.selectedMeta}>
        현재 선택: <strong>{labelOf(selected)}</strong>
      </p>
    </section>
  )
}

function SoftGrayUnderlineDropdownVariant() {
  const [selected, setSelected] = useState<SectorKey>('all')

  return (
    <section className={styles.variantWrap}>
      <p className={styles.variantLabel}>Dropdown (Underline Gray) - 라인 강조형</p>
      <div className={styles.selectWrapUnder}>
        <select
          className={styles.selectUnder}
          value={selected}
          onChange={(event) => setSelected(event.target.value as SectorKey)}
          aria-label="섹터 선택 언더라인 그레이"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {labelOf(sector)}
            </option>
          ))}
        </select>
        <span className={styles.selectChevronUnder} aria-hidden>
          ▾
        </span>
      </div>
      <p className={styles.selectedMeta}>
        현재 선택: <strong>{labelOf(selected)}</strong>
      </p>
    </section>
  )
}

export default function DevSectorFilterPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>섹터 선택 UI 비교</h1>
      <p className={styles.desc}>칩 방식과 드롭다운 방식을 dev에서 먼저 비교합니다.</p>
      <div className={styles.grid}>
        <CurrentVariant />
        <MinimalUnderlineVariant />
        <SolidPrimaryVariant />
        <GhostContrastVariant />
        <DropdownVariant />
        <CompactDropdownVariant />
        <SoftGrayDropdownVariant />
        <SoftGrayInsetDropdownVariant />
        <SoftGrayUnderlineDropdownVariant />
      </div>
    </main>
  )
}
