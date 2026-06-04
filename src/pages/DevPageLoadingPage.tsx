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

type LoadingMode = 'splash' | 'skeleton'

const MODE_OPTIONS: { key: LoadingMode; label: string }[] = [
  { key: 'splash', label: '스플래시 (BitMEX형)' },
  { key: 'skeleton', label: '스켈레톤' },
]

const SKELETON_VARIANTS: { key: PageLoadingVariant; label: string }[] = [
  { key: 'stockDetail', label: '종목 상세' },
  { key: 'dashboard', label: '홈' },
  { key: 'buzz', label: '언급량 급등' },
  { key: 'list', label: '리스트' },
]

export default function DevPageLoadingPage() {
  const [mode, setMode] = useState<LoadingMode>('skeleton')
  const [variant, setVariant] = useState<PageLoadingVariant>('stockDetail')
  const [replayKey, setReplayKey] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  const preview = useMemo(() => {
    if (!showLoading) {
      return (
        <p className={styles.doneHint}>
          로딩이 끝난 뒤 실제 페이지 콘텐츠가 표시됩니다.
        </p>
      )
    }

    if (mode === 'splash') {
      return <PageLoading key={`splash-${replayKey}`} variant="splash" />
    }

    return <PageLoading key={`${variant}-${replayKey}`} variant={variant} />
  }, [showLoading, mode, variant, replayKey])

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
          description="실서비스는 스켈레톤(레이아웃 유지). 스플래시는 BitMEX형 참고용으로만 dev에서 비교합니다."
          align="center"
        />

        <div className={styles.devBar}>
          <span className={styles.devTag}>DEV</span>
          <nav className={styles.devLinks} aria-label="개발 시안">
            <Link to="/dev">Dev hub</Link>
            <Link to="/stock">전체 종목</Link>
            <Link to="/stock/005930">종목 상세 (실제 적용)</Link>
          </nav>
        </div>

        <div className={styles.controls}>
          <UnderlineTabNav
            ariaLabel="로딩 방식"
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
          />

          {mode === 'skeleton' ? (
            <div className={styles.subControls}>
              <UnderlineTabNav
                ariaLabel="스켈레톤 레이아웃"
                options={SKELETON_VARIANTS}
                value={variant}
                onChange={(key) => setVariant(key as PageLoadingVariant)}
              />
            </div>
          ) : null}

          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={replay} disabled={simulating}>
              다시 보기
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

        {mode === 'splash' ? (
          <p className={styles.splashNote}>
            스플래시 모드는 아래 버튼 대신 화면 전체에 표시됩니다. (종목 상세와 동일)
          </p>
        ) : (
          <section className={styles.preview} aria-live="polite">
            {preview}
          </section>
        )}

        {mode === 'splash' && showLoading ? preview : null}
      </div>
    </Layout>
  )
}
