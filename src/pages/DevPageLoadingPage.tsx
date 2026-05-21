import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import {
  PageLoading,
  type PageLoadingVariant,
} from '../components/common/pageLoading/PageLoading'
import { UnderlineTabNav } from '../components/common/UnderlineTabNav'
import styles from './DevPageLoadingPage.module.css'

const VARIANT_OPTIONS: { key: PageLoadingVariant; label: string }[] = [
  { key: 'stockDetail', label: '종목 상세' },
  { key: 'dashboard', label: '홈' },
  { key: 'buzz', label: '언급량 급등' },
  { key: 'list', label: '리스트' },
]

export default function DevPageLoadingPage() {
  const [variant, setVariant] = useState<PageLoadingVariant>('stockDetail')
  const [replayKey, setReplayKey] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  const preview = useMemo(() => {
    if (!showLoading) {
      return (
        <p className={styles.doneHint}>
          로딩이 끝난 뒤 실제 페이지 콘텐츠가 이 영역에 들어갑니다.
        </p>
      )
    }
    return <PageLoading key={`${variant}-${replayKey}`} variant={variant} />
  }, [showLoading, variant, replayKey])

  const replay = () => {
    setShowLoading(false)
    setSimulating(true)
    window.setTimeout(() => {
      setReplayKey((k) => k + 1)
      setShowLoading(true)
      setSimulating(false)
    }, 80)
  }

  const simulateFetch = () => {
    setShowLoading(true)
    setSimulating(true)
    window.setTimeout(() => {
      setShowLoading(false)
      setSimulating(false)
    }, 2400)
  }

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="페이지 로딩 시안"
          description="실제 레이아웃(상단 네비·티커) 안에서 전체 페이지 스켈레톤을 확인합니다."
          align="center"
        />

        <div className={styles.devBar}>
          <span className={styles.devTag}>DEV</span>
          <nav className={styles.devLinks} aria-label="개발 시안">
            <Link to="/dev">Dev hub</Link>
            <Link to="/dev/refined">Refined</Link>
            <Link to="/stock/005930">종목 상세 (실제)</Link>
          </nav>
        </div>

        <div className={styles.controls}>
          <UnderlineTabNav
            ariaLabel="로딩 시안 종류"
            options={VARIANT_OPTIONS}
            value={variant}
            onChange={setVariant}
          />
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={replay} disabled={simulating}>
              스켈레톤 다시 보기
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={simulateFetch}
              disabled={simulating}
            >
              API 2.4초 후 종료 시뮬레이션
            </button>
          </div>
        </div>

        <section className={styles.preview} aria-live="polite">
          {preview}
        </section>
      </div>
    </Layout>
  )
}
