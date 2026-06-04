import type { FormEvent } from 'react'
import { useEffect } from 'react'
import { usePasswordReset } from '../../hooks/usePasswordReset'
import { ActionButton } from '../ui/ActionButton'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'
import styles from './MyPagePasswordChangeModal.module.css'

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
  const {
    newPassword,
    confirmPassword,
    fieldErrors,
    saving,
    setNewPassword,
    setConfirmPassword,
    clearFieldError,
    submit,
    resetForm,
  } = usePasswordReset({
    email,
    onSuccess: () => {
      resetForm()
      onSuccess?.()
    },
    onError,
  })

  useEffect(() => {
    if (!isOpen) resetForm()
  }, [isOpen, resetForm])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="비밀번호 변경"
      showCloseButton
      closeButtonLabel="비밀번호 변경 닫기"
      lockBackgroundScroll
      closeOnEsc={!saving}
      closeOnOverlay={!saving}
      contentClassName={styles.dialog}
      bodyClassName={styles.body}
      overlayClassName={styles.overlay}
    >
      <form className={styles.form} noValidate onSubmit={handlePasswordSubmit}>
        <p className={styles.lead}>이메일 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.</p>
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
    </Modal>
  )
}
