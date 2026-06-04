import { useCallback, useEffect, useState } from 'react'
import { sendEmailVerification } from '../../data/clients/authClient'
import { getApiErrorMessage } from '../../data/util/apiError'
import { AuthEmailVerifyStep } from '../auth/AuthEmailVerifyStep'
import authModalStyles from '../auth/AuthEmailVerifyModal.module.css'
import { Modal } from '../ui/Modal'
import styles from './MyPagePasswordVerifyModal.module.css'

type VerifyPhase = 'idle' | 'sending' | 'ready' | 'error'

interface MyPagePasswordVerifyModalProps {
  isOpen: boolean
  email: string
  onClose: () => void
  onVerified: () => void | Promise<void>
}

export function MyPagePasswordVerifyModal({
  isOpen,
  email,
  onClose,
  onVerified,
}: MyPagePasswordVerifyModalProps) {
  const [phase, setPhase] = useState<VerifyPhase>('idle')
  const [sendError, setSendError] = useState<string | null>(null)

  const sendVerificationMail = useCallback(async () => {
    setPhase('sending')
    setSendError(null)
    try {
      await sendEmailVerification(email, 'PASSWORD_RESET')
      setPhase('ready')
    } catch (error) {
      setSendError(getApiErrorMessage(error, '인증 메일 발송에 실패했습니다.'))
      setPhase('error')
    }
  }, [email])

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle')
      setSendError(null)
      return
    }
    void sendVerificationMail()
  }, [isOpen, sendVerificationMail])

  const handleClose = () => {
    setPhase('idle')
    setSendError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      closeButtonLabel="이메일 인증 닫기"
      lockBackgroundScroll
      closeOnEsc={phase !== 'sending'}
      closeOnOverlay={phase !== 'sending'}
      contentClassOnly
      contentClassName={authModalStyles.dialog}
      bodyClassName={authModalStyles.body}
      overlayClassName={authModalStyles.overlay}
    >
      {phase === 'sending' ? (
        <div className={styles.sendingPanel} aria-live="polite" aria-busy="true">
          <p className={styles.sendingText}>인증 메일을 보내는 중...</p>
          <div className={styles.spinnerAnchor} aria-hidden>
            <span className={styles.spinner} />
          </div>
        </div>
      ) : null}

      {phase === 'error' ? (
        <div className={styles.errorPanel}>
          <p className={styles.errorText} role="alert">
            {sendError}
          </p>
          <button type="button" className={styles.retryButton} onClick={() => void sendVerificationMail()}>
            다시 시도
          </button>
        </div>
      ) : null}

      {phase === 'ready' ? (
        <AuthEmailVerifyStep
          email={email}
          purpose="PASSWORD_RESET"
          showTopBar={false}
          initialCodeExpanded
          onBack={handleClose}
          onVerified={onVerified}
        />
      ) : null}
    </Modal>
  )
}
