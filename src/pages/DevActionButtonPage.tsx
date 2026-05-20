import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionButton } from '../components/ui/ActionButton'
import { AlertModal } from '../components/ui/AlertModal'
import { InlineJobStatus } from '../components/ui/InlineJobStatus'
import { Snackbar } from '../components/ui/Snackbar'
import { useRemoteJobFeedback } from '../hooks/useRemoteJobFeedback'
import styles from './DevActionButtonPage.module.css'

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function DevActionButtonPage() {
  const [clickCount, setClickCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)
  const [undoSnackbarVisible, setUndoSnackbarVisible] = useState(false)
  const [plainSnackbarVisible, setPlainSnackbarVisible] = useState(false)

  const undoTimerRef = useRef<number | null>(null)
  const plainTimerRef = useRef<number | null>(null)
  const remoteJob = useRemoteJobFeedback()

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      if (plainTimerRef.current) window.clearTimeout(plainTimerRef.current)
    }
  }, [])

  const startRemoteCrawling = () => {
    remoteJob.start()
  }

  const cancelRemoteCrawling = () => {
    remoteJob.cancel()
  }

  const handleUndoSnackbarAction = async () => {
    await sleep(500)
    setUndoSnackbarVisible(true)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = window.setTimeout(() => {
      setUndoSnackbarVisible(false)
    }, 4000)
  }

  const handlePlainSnackbarAction = async () => {
    await sleep(500)
    setPlainSnackbarVisible(true)
    if (plainTimerRef.current) window.clearTimeout(plainTimerRef.current)
    plainTimerRef.current = window.setTimeout(() => {
      setPlainSnackbarVisible(false)
    }, 3200)
  }

  const handleLoadingClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    setClickCount((prev) => prev + 1)
    try {
      await sleep(1400)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await sleep(1200)
      setDeleteCount((prev) => prev + 1)
      setIsDeleteAlertOpen(false)
      setUndoSnackbarVisible(true)
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = window.setTimeout(() => {
        setUndoSnackbarVisible(false)
      }, 4000)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Action Button Dev Page</h1>
        <p className={styles.desc}>원격 작업 피드백 패턴(인라인+진행형)과 스낵바(Undo) 테스트</p>

        <div className={styles.grid}>
          <div className={styles.item}>
            <h2 className={styles.label}>ActionButton/Modal 상태 회귀 테스트</h2>
            <div className={styles.row}>
              <ActionButton variant="confirm">Confirm</ActionButton>
              <ActionButton variant="confirm" loading={isLoading} onClick={handleLoadingClick}>
                Loading Test
              </ActionButton>
            </div>
            <div className={styles.row}>
              <ActionButton variant="danger" disabled>
                Deny (Disabled)
              </ActionButton>
              <ActionButton variant="danger" onClick={() => setIsDeleteAlertOpen(true)}>
                Refuse (Danger + Confirm Modal)
              </ActionButton>
            </div>
            <p className={styles.meta}>Loading accepted clicks: {clickCount}</p>
            <p className={styles.meta}>Confirmed refuse count: {deleteCount}</p>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>인라인 상태 + 진행형 피드백 (원격 크롤링 가정)</h2>
            <div className={styles.row}>
              <ActionButton
                variant="confirm"
                onClick={startRemoteCrawling}
                loading={remoteJob.isRunning}
              >
                {remoteJob.isRunning ? '원격 크롤링 실행 중' : '원격 크롤링 시작'}
              </ActionButton>
              <ActionButton variant="danger" onClick={cancelRemoteCrawling} disabled={!remoteJob.isRunning}>
                중단
              </ActionButton>
            </div>
            <InlineJobStatus
              status={remoteJob.status}
              progress={remoteJob.progress}
              jobId={remoteJob.jobId}
              isRunning={remoteJob.isRunning}
            />
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>스낵바 (Undo 포함)</h2>
            <ActionButton variant="danger" onClick={handleUndoSnackbarAction}>
              항목 삭제 + Undo 스낵바
            </ActionButton>
            <p className={styles.meta}>되돌리기 같은 후속 액션이 필요할 때</p>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>스낵바 (일반형)</h2>
            <ActionButton variant="confirm" onClick={handlePlainSnackbarAction}>
              설정 저장 + 일반 스낵바
            </ActionButton>
            <p className={styles.rule}>
              후속 액션이 없고 결과만 알려주면 되는 경우
            </p>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>에러 페이지 시안</h2>
            <div className={styles.linkRow}>
              <Link className={styles.devLink} to="/dev/errors">
                Error pages (404 · 401 · 500 …)
              </Link>
            </div>
            <p className={styles.meta}>백엔드 ErrorCode 메시지와 맞춘 공통 AppErrorPage 프리뷰</p>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>Dev Sidebar 디자인 프리뷰</h2>
            <div className={styles.linkRow}>
              <Link className={styles.devLink} to="/dev/layout-home">
                Layout 홈 (무사이드바)
              </Link>
              <Link className={styles.devLink} to="/dev/layout-split">
                Layout 상세 (split)
              </Link>
              <Link className={styles.devLink} to="/dev/sidebar-minimal">
                Minimal
              </Link>
              <Link className={styles.devLink} to="/dev/sidebar-glass">
                Glass
              </Link>
              <Link className={styles.devLink} to="/dev/sidebar-compact">
                Compact
              </Link>
            </div>
            <p className={styles.meta}>전역 스타일 변경 없이 /dev 경로에서만 사이드바 시안을 확인합니다.</p>
          </div>
        </div>
      </section>

      {undoSnackbarVisible ? (
        <Snackbar
          message="항목이 삭제되었습니다."
          actionLabel="되돌리기"
          onAction={() => {
            setUndoSnackbarVisible(false)
          }}
        />
      ) : null}

      {plainSnackbarVisible ? <Snackbar message="설정이 저장되었습니다." /> : null}

      <AlertModal
        isOpen={isDeleteAlertOpen}
        title="정말 거부 처리하시겠습니까?"
        message="이 동작은 취소할 수 없습니다. 계속 진행하시겠어요?"
        onClose={() => {
          if (isDeleting) return
          setIsDeleteAlertOpen(false)
        }}
        onConfirm={handleDeleteConfirm}
        confirmLabel="거부"
        cancelLabel="취소"
        confirmLoading={isDeleting}
        tone="danger"
      />
    </main>
  )
}
