import { useCallback, useRef, useState } from 'react'
import { changeMemberPassword } from '../data/clients/memberClient'
import { getApiErrorMessage } from '../data/util/apiError'

type PasswordChangeField = 'currentPassword' | 'newPassword' | 'confirmPassword'

interface UsePasswordChangeOptions {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function usePasswordChange(options?: UsePasswordChangeOptions) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PasswordChangeField, string>>>({})
  const [saving, setSaving] = useState(false)
  const onSuccessRef = useRef(options?.onSuccess)
  const onErrorRef = useRef(options?.onError)
  onSuccessRef.current = options?.onSuccess
  onErrorRef.current = options?.onError

  const clearFieldError = useCallback((field: PasswordChangeField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const resetForm = useCallback(() => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setFieldErrors({})
  }, [])

  const submit = useCallback(async () => {
    if (saving) return

    const nextErrors: Partial<Record<PasswordChangeField, string>> = {}
    if (!currentPassword.trim()) {
      nextErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }
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
      await changeMemberPassword({
        currentPassword: currentPassword.trim(),
        newPassword,
      })
      resetForm()
      onSuccessRef.current?.()
    } catch (error) {
      const message = getApiErrorMessage(error, '비밀번호 변경에 실패했습니다.')
      if (message.includes('현재 비밀번호')) {
        setFieldErrors({ currentPassword: message })
      } else {
        onErrorRef.current?.(message)
      }
    } finally {
      setSaving(false)
    }
  }, [confirmPassword, currentPassword, newPassword, resetForm, saving])

  return {
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
  }
}
