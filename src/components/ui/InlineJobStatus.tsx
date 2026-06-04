import type { RemoteJobStatus } from '../../hooks/useRemoteJobFeedback'
import styles from './InlineJobStatus.module.css'

interface InlineJobStatusProps {
  status: RemoteJobStatus
  progress: number
  jobId: number
  isRunning: boolean
}

export function InlineJobStatus({ status, progress, jobId, isRunning }: InlineJobStatusProps) {
  const progressToneClass =
    status === 'success'
      ? styles.fillSuccess
      : status === 'cancelled'
        ? styles.fillWarning
        : status === 'error'
          ? styles.fillDanger
          : styles.fillPrimary

  return (
    <>
      <p className={styles.meta}>
        상태:
        <span className={[styles.statusTag, styles[status]].join(' ')}>
          {status === 'idle' && '대기'}
          {status === 'pending' && '작업 진행 중'}
          {status === 'success' && '완료'}
          {status === 'error' && '실패'}
          {status === 'cancelled' && '중단됨'}
        </span>
      </p>
      <div className={styles.progressTrack} aria-hidden>
        <div className={[styles.progressFill, progressToneClass].join(' ')} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.meta}>
        {isRunning
          ? `작업 #${jobId} 처리 중 ${progress}%`
          : status === 'cancelled'
            ? `작업 #${jobId} 중단됨 (${progress}%)`
            : status === 'success'
              ? `작업 #${jobId} 완료`
              : '대기 중'}
      </p>
    </>
  )
}
