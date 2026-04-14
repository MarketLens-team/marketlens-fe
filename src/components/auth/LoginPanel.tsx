import { useRef, useState } from 'react'
import { TextField } from '../ui/TextField'
import { ActionButton } from '../ui/ActionButton'
import styles from './LoginPanel.module.css'

export interface LoginPanelProps {
  onSubmit: (email: string, password: string) => void | Promise<void>
}

export default function LoginPanel({ onSubmit }: LoginPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const validate = () => {
    const emailTrimmed = email.trim()
    if (!emailTrimmed) {
      const next = { email: '이메일을 입력해주세요.' }
      setErrors(next)
      emailRef.current?.focus()
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      const next = { email: '올바른 이메일 형식을 입력해주세요.' }
      setErrors(next)
      emailRef.current?.focus()
      return false
    }
    if (!password.trim()) {
      const next = { password: '비밀번호를 입력해주세요.' }
      setErrors(next)
      passwordRef.current?.focus()
      return false
    }
    setErrors({})
    return true
  }

  const validateEmailOnly = () => {
    const emailTrimmed = email.trim()
    if (!emailTrimmed) {
      setErrors({ email: '이메일을 입력해주세요.' })
      emailRef.current?.focus()
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' })
      emailRef.current?.focus()
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSubmit(email.trim(), password))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden />
      <main className={styles.panel}>
        <div className={styles.brand}>Market Lens</div>
        <h1 className={styles.title}>회원 로그인</h1>
        <p className={styles.subtitle}>거래를 시작하려면 로그인하세요</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <TextField
            inputRef={emailRef}
            id="email"
            label="이메일 주소"
            value={email}
            onChange={(value) => {
              setEmail(value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            placeholder="user@example.com"
            type="email"
            error={errors.email}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              if (!validateEmailOnly()) return
              passwordRef.current?.focus()
            }}
          />
          <TextField
            inputRef={passwordRef}
            id="password"
            label="비밀번호"
            value={password}
            onChange={(value) => {
              setPassword(value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            placeholder="비밀번호를 입력하세요"
            type="password"
            error={errors.password}
          />

          <ActionButton className={styles.submit} type="submit" variant="confirm" loading={isSubmitting}>
            로그인
          </ActionButton>
        </form>

        <p className={styles.helpText}>비밀번호를 잊으셨나요?</p>
        <p className={styles.joinText}>아직 계정이 없으신가요? 회원가입하기</p>
      </main>
    </div>
  )
}
