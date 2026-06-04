import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { sendEmailVerification } from '../../data/clients/authClient'
import { usePasswordChange } from '../../hooks/usePasswordChange'
import { AuthEmailVerifyStep } from '../auth/AuthEmailVerifyStep'
import { ActionButton } from '../ui/ActionButton'
import { ButtonSpinner } from '../ui/ButtonSpinner'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'
import styles from './MyPagePasswordChangeModal.module.css'

type ModalStep = 'verify' | 'password'

interface MyPagePasswordChangeModalProps {
  isOpen: boolean
  email: string
  onClose: () => void
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function MyPagePasswordChangeModal({
  isOpen,
  email,
  onClose,
  onSuccess,
  onError,
}: MyPagePasswordChangeModalProps) {
  const [step, setStep] = useState<ModalStep>('verify')
  const [sendingMail, setSendingMail] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const {
    currentPassword,
    newPassword,
    confirmPassword,
    fieldErrors,
    saving,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    clearFieldError,
    submit,
    resetForm,
  } = usePasswordChange({
    onSuccess: () => {
      resetForm()
      onSuccess?.()
    },
    onError,
  })

  useEffect(() => {
    if (!isOpen) {
      setStep('verify')
      setSendError(null)
      resetForm()
      return
    }

    let cancelled = false
    setSendingMail(true)
    setSendError(null)

    void sendEmailVerification(email, 'PASSWORD_RESET')
      .catch((error) => {
        if (cancelled) return
        setSendError(error instanceof Error ? error.message : '인증 메일 발송에 실패했습니다.')
      })
      .finally(() => {
        if (!cancelled) setSendingMail(false)
      })

    return () => {
      cancelled = true
    }
  }, [email, isOpen, resetForm])

  const handleClose = () => {
    resetForm()
    setStep('verify')
    setSendError(null)
    onClose()
  }

  const handleRetrySend = async () => {
    setSendingMail(true)
    setSendError(null)
    try {
      await sendEmailVerification(email, 'PASSWORD_RESET')
    } catch (error) {
      setSendError(error instanceof Error ? error.message : '인증 메일 발송에 실패했습니다.')
    } finally {
      setSendingMail(false)
    }
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'verify' ? undefined : '비밀번호 변경'}
      showCloseButton
      closeButtonLabel="비밀번호 변경 닫기"
      lockBackgroundScroll
      closeOnEsc={!saving}
      closeOnOverlay={!saving}
      contentClassOnly={step === 'verify'}
      contentClassName={step === 'verify' ? styles.verifyDialog : styles.passwordDialog}
      bodyClassName={step === 'verify' ? styles.verifyBody : styles.passwordBody}
      overlayClassName={styles.overlay}
    >
      {step === 'verify' ? (
        <>
          {sendingMail ? (
            <p className={styles.sending} aria-live="polite">
              <ButtonSpinner />
              <span>인증 메일을 보내는 중...</span>
            </p>
          ) : null}
          {sendError ? (
            <div className={styles.sendErrorBlock}>
              <p className={styles.sendError} role="alert">
                {sendError}
              </p>
              <button type="button" className={styles.retryButton} onClick={() => void handleRetrySend()}>
                다시 보내기
              </button>
            </div>
          ) : null}
          {!sendingMail && !sendError ? (
            <AuthEmailVerifyStep
              email={email}
              purpose="PASSWORD_RESET"
              showTopBar={false}
              initialCodeExpanded
              onBack={handleClose}
              onVerified={() => setStep('password')}
            />
          ) : null}
        </>
      ) : (
        <form className={styles.form} noValidate onSubmit={handlePasswordSubmit}>
          <p className={styles.lead}>이메일 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.</p>
          <TextField
            id="mypage-modal-current-password"
            label="현재 비밀번호"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value)
              clearFieldError('currentPassword')
            }}
            type="password"
            placeholder="현재 비밀번호 입력"
            error={fieldErrors.currentPassword}
          />
          <TextField
            id="mypage-modal-new-password"
            label="새 비밀번호"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value)
              clearFieldError('newPassword')
            }}
            type="password"
            placeholder="8자 이상 입력"
            error={fieldErrors.newPassword}
          />
          <TextField
            id="mypage-modal-confirm-password"
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value)
              clearFieldError('confirmPassword')
            }}
            type="password"
            placeholder="새 비밀번호 다시 입력"
            error={fieldErrors.confirmPassword}
          />
          <div className={styles.actions}>
            <ActionButton type="submit" loading={saving} className={styles.submitButton}>
              비밀번호 변경
            </ActionButton>
          </div>
        </form>
      )}
    </Modal>
  )
}
