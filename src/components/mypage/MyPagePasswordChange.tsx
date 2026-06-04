import type { FormEvent } from 'react'
import { usePasswordChange } from '../../hooks/usePasswordChange'
import { ActionButton } from '../ui/ActionButton'
import { TextField } from '../ui/TextField'
import styles from './MyPagePasswordChange.module.css'

interface MyPagePasswordChangeProps {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function MyPagePasswordChange({ onSuccess, onError }: MyPagePasswordChangeProps) {
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
  } = usePasswordChange({ onSuccess, onError })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  return (
    <section className={styles.root} aria-labelledby="password-change-title">
      <h2 id="password-change-title" className={styles.pageTitle}>
        비밀번호 변경
      </h2>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <TextField
          id="mypage-current-password"
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
          id="mypage-new-password"
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
          id="mypage-confirm-password"
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
    </section>
  )
}
