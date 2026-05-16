import { useId, useRef, useState, type FormEvent, type KeyboardEventHandler, type RefObject } from 'react'
import { ButtonSpinner } from '../ui/ButtonSpinner'
import { AuthPasswordVisibilityToggle } from './AuthPasswordVisibilityToggle'
import styles from './AuthPanel.module.css'

export type AuthMode = 'login' | 'signup'

export interface AuthPanelProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onLogin: (email: string, password: string) => void | Promise<void>
  onSignup: (email: string, password: string, nickname: string) => void | Promise<void>
}

type FieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'nickname', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  inputRef,
  onKeyDown,
  showToggle,
  visible,
  onToggleVisible,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  error?: string
  inputRef?: RefObject<HTMLInputElement>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  showToggle?: boolean
  visible?: boolean
  onToggleVisible?: () => void
  autoComplete?: string
}) {
  const messageId = `${id}-error`
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          id={id}
          className={`${styles.input} ${showToggle ? styles.inputWithToggle : ''} ${error ? styles.inputError : ''}`.trim()}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={inputType}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          onKeyDown={onKeyDown}
        />
        {showToggle && onToggleVisible ? (
          <AuthPasswordVisibilityToggle visible={Boolean(visible)} onToggle={onToggleVisible} />
        ) : null}
      </div>
      <p id={messageId} className={styles.fieldMessage} role="alert">
        {error ?? '\u00A0'}
      </p>
    </div>
  )
}

export default function AuthPanel({ mode, onModeChange, onLogin, onSignup }: AuthPanelProps) {
  const formId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nicknameRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const clearFieldError = (key: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const syncPasswordMatch = (nextPassword: string, nextConfirm: string) => {
    if (mode !== 'signup') return
    setErrors((prev) => {
      const next = { ...prev }
      if (nextConfirm.length > 0 && nextPassword !== nextConfirm) {
        next.confirmPassword = '비밀번호가 일치하지 않습니다.'
      } else {
        delete next.confirmPassword
      }
      return next
    })
  }

  const switchMode = (next: AuthMode) => {
    if (next === mode) return
    setErrors({})
    setFormMessage(null)
    setPasswordVisible(false)
    setConfirmVisible(false)
    onModeChange(next)
  }

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return '이메일을 입력해주세요.'
    if (!EMAIL_PATTERN.test(trimmed)) return '올바른 이메일 형식을 입력해주세요.'
    return undefined
  }

  const validateLogin = () => {
    const next: FieldErrors = {}
    const emailError = validateEmail(email)
    if (emailError) next.email = emailError
    if (!password.trim()) next.password = '비밀번호를 입력해주세요.'
    setErrors(next)
    if (next.email) {
      emailRef.current?.focus()
      return false
    }
    if (next.password) {
      passwordRef.current?.focus()
      return false
    }
    return true
  }

  const validateSignup = () => {
    const next: FieldErrors = {}
    const emailError = validateEmail(email)
    if (emailError) next.email = emailError
    const nick = nickname.trim()
    if (nick.length < 2 || nick.length > 20) {
      next.nickname = '닉네임은 2~20자로 입력해주세요.'
    }
    if (password.length < 8) {
      next.password = '비밀번호는 8자 이상이어야 합니다.'
    }
    if (password !== confirmPassword) {
      next.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }
    setErrors(next)
    if (next.email) {
      emailRef.current?.focus()
      return false
    }
    if (next.nickname) {
      nicknameRef.current?.focus()
      return false
    }
    if (next.password) {
      passwordRef.current?.focus()
      return false
    }
    if (next.confirmPassword) {
      confirmRef.current?.focus()
      return false
    }
    return true
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setFormMessage(null)
    if (!validateLogin()) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(onLogin(email.trim(), password))
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setFormMessage(null)
    if (!validateSignup()) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSignup(email.trim(), password, nickname.trim()))
      setPassword('')
      setConfirmPassword('')
      setNickname('')
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="인증">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`.trim()}
            onClick={() => switchMode('login')}
          >
            로그인
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`.trim()}
            onClick={() => switchMode('signup')}
          >
            회원 가입
          </button>
        </div>

        {formMessage ? (
          <p
            className={formMessage.type === 'success' ? styles.formSuccess : styles.formBanner}
            role={formMessage.type === 'error' ? 'alert' : 'status'}
          >
            {formMessage.text}
          </p>
        ) : null}

        {mode === 'login' ? (
          <form id={`${formId}-login`} className={styles.form} onSubmit={handleLoginSubmit} noValidate>
            <AuthField
              id="auth-email"
              label="이메일 주소"
              value={email}
              onChange={(value) => {
                setEmail(value)
                clearFieldError('email')
              }}
              placeholder="이메일 주소 입력..."
              type="email"
              error={errors.email}
              inputRef={emailRef}
              autoComplete="email"
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                if (validateEmail(email)) return
                passwordRef.current?.focus()
              }}
            />
            <AuthField
              id="auth-password"
              label="비밀번호"
              value={password}
              onChange={(value) => {
                setPassword(value)
                clearFieldError('password')
              }}
              placeholder="비밀번호 입력..."
              type="password"
              error={errors.password}
              inputRef={passwordRef}
              autoComplete="current-password"
              showToggle
              visible={passwordVisible}
              onToggleVisible={() => setPasswordVisible((v) => !v)}
            />
            <div className={styles.forgotRow}>
              <button type="button" className={styles.forgotLink}>
                비밀번호를 잊으셨나요?
              </button>
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              data-loading={isSubmitting ? 'true' : 'false'}
            >
              <span className={styles.submitLabel}>로그인</span>
              {isSubmitting ? <ButtonSpinner /> : null}
            </button>
          </form>
        ) : (
          <form id={`${formId}-signup`} className={styles.form} onSubmit={handleSignupSubmit} noValidate>
            <AuthField
              id="auth-signup-email"
              label="이메일 주소"
              value={email}
              onChange={(value) => {
                setEmail(value)
                clearFieldError('email')
              }}
              placeholder="이메일 주소 입력..."
              type="email"
              error={errors.email}
              inputRef={emailRef}
              autoComplete="email"
            />
            <AuthField
              id="auth-signup-nickname"
              label="닉네임"
              value={nickname}
              onChange={(value) => {
                setNickname(value)
                clearFieldError('nickname')
              }}
              placeholder="닉네임 입력 (2~20자)"
              error={errors.nickname}
              inputRef={nicknameRef}
              autoComplete="nickname"
            />
            <AuthField
              id="auth-signup-password"
              label="비밀번호"
              value={password}
              onChange={(value) => {
                setPassword(value)
                clearFieldError('password')
                syncPasswordMatch(value, confirmPassword)
              }}
              placeholder="8자 이상 입력..."
              type="password"
              error={errors.password}
              inputRef={passwordRef}
              autoComplete="new-password"
              showToggle
              visible={passwordVisible}
              onToggleVisible={() => setPasswordVisible((v) => !v)}
            />
            <AuthField
              id="auth-signup-confirm"
              label="비밀번호 확인"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value)
                syncPasswordMatch(password, value)
              }}
              placeholder="비밀번호 다시 입력..."
              type="password"
              error={errors.confirmPassword}
              inputRef={confirmRef}
              autoComplete="new-password"
              showToggle
              visible={confirmVisible}
              onToggleVisible={() => setConfirmVisible((v) => !v)}
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              data-loading={isSubmitting ? 'true' : 'false'}
            >
              <span className={styles.submitLabel}>회원 가입</span>
              {isSubmitting ? <ButtonSpinner /> : null}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
