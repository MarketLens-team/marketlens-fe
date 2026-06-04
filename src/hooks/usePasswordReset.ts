import { useCallback, useRef, useState } from 'react'
import { resetPassword } from '../data/clients/authClient'
import { getApiErrorMessage } from '../data/util/apiError'

type PasswordResetField = 'newPassword' | 'confirmPassword'

interface UsePasswordResetOptions {
  email: string
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function usePasswordReset({ email, onSuccess, onError }: UsePasswordResetOptions) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PasswordResetField, string>>>({})
  const [saving, setSaving] = useState(false)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const clearFieldError = useCallback((field: PasswordResetField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const resetForm = useCallback(() => {
    setNewPassword('')
    setConfirmPassword('')
    setFieldErrors({})
  }, [])

  const submit = useCallback(async () => {
    if (saving) return

    const nextErrors: Partial<Record<PasswordResetField, string>> = {}
    if (newPassword.length < 8) {
      nextErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.'
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      await resetPassword({ email: email.trim(), newPassword })
      resetForm()
      onSuccessRef.current?.()
    } catch (error) {
      onErrorRef.current?.(getApiErrorMessage(error, '비밀번호 변경에 실패했습니다.'))
    } finally {
      setSaving(false)
    }
  }, [confirmPassword, email, newPassword, resetForm, saving])

  return {
    newPassword,
    confirmPassword,
    fieldErrors,
    saving,
    setNewPassword,
    setConfirmPassword,
    clearFieldError,
    submit,
    resetForm,
  }
}
