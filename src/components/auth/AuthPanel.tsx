import {
  useId,
  useRef,
  useState,
  type FocusEventHandler,
  type FormEvent,
  type KeyboardEventHandler,
  type RefObject,
} from 'react'
import type { CompleteRegistrationInput } from '../../data/clients/completeRegistration'
import type { AlertSettings } from '../../data/types/member'
import type { WatchlistItem } from '../../store/watchlistStore'
import { ButtonSpinner } from '../ui/ButtonSpinner'
import { AuthPasswordVisibilityToggle } from './AuthPasswordVisibilityToggle'
import { DEFAULT_ALERT_SETTINGS, SignupAlertsStep } from './SignupAlertsStep'
import { SignupWatchlistStep } from './SignupWatchlistStep'
import styles from './AuthPanel.module.css'

export type AuthMode = 'login' | 'signup'

type SignupStep = 1 | 2 | 3

export interface AuthPanelProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onLogin: (email: string, password: string) => void | Promise<void>
  onCompleteRegistration: (input: CompleteRegistrationInput) => void | Promise<void>
}

type FieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'nickname', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LOGIN_AUTH_ERROR_MESSAGE = '이메일 및 비밀번호가 일치하지 않습니다. 다시 시도해 주세요.'

function isLoginCredentialError(message: string) {
  return (
    message.includes('이메일 또는 비밀번호') ||
    message.includes('올바르지 않습니다') ||
    message.includes('User not found')
  )
}

function isEmailDuplicateError(message: string) {
  return message.includes('이미 사용 중인 이메일')
}

function AuthField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  invalid,
  inputRef,
  onBlur,
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
  invalid?: boolean
  inputRef?: RefObject<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  showToggle?: boolean
  visible?: boolean
  onToggleVisible?: () => void
  autoComplete?: string
}) {
  const messageId = `${id}-error`
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type
  const hasInputError = invalid || Boolean(error)
  const showMessage = Boolean(error)

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          id={id}
          className={`${styles.input} ${showToggle ? styles.inputWithToggle : ''} ${hasInputError ? styles.inputError : ''}`.trim()}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={inputType}
          autoComplete={autoComplete}
          aria-invalid={hasInputError}
          aria-describedby={showMessage ? messageId : undefined}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
        {showToggle && onToggleVisible ? (
          <AuthPasswordVisibilityToggle visible={Boolean(visible)} onToggle={onToggleVisible} />
        ) : null}
      </div>
      {showMessage ? (
        <p id={messageId} className={styles.fieldMessage} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function AuthPanel({ mode, onModeChange, onLogin, onCompleteRegistration }: AuthPanelProps) {
  const formId = useId()
  const [signupStep, setSignupStep] = useState<SignupStep>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [watchlistSelection, setWatchlistSelection] = useState<WatchlistItem[]>([])
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [stepError, setStepError] = useState<string | null>(null)
  const [loginAuthError, setLoginAuthError] = useState<string | null>(null)
  const [signupSubmitError, setSignupSubmitError] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState<{ type: 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nicknameRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const isSignupMultiStep = mode === 'signup' && signupStep > 1

  const clearFieldError = (key: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const syncPasswordMatch = (nextPassword: string, nextConfirm: string) => {
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

  const resetSignupFlow = () => {
    setSignupStep(1)
    setWatchlistSelection([])
    setAlertSettings(DEFAULT_ALERT_SETTINGS)
    setStepError(null)
    setSignupSubmitError(null)
  }

  const switchMode = (next: AuthMode) => {
    if (next === mode) return
    setErrors({})
    setLoginAuthError(null)
    setSignupSubmitError(null)
    setFormMessage(null)
    setPasswordVisible(false)
    setConfirmVisible(false)
    resetSignupFlow()
    onModeChange(next)
  }

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return '이메일을 입력해주세요.'
    if (!EMAIL_PATTERN.test(trimmed)) return '올바른 이메일 형식을 입력해주세요.'
    return undefined
  }

  const handleEmailBlur = () => {
    const trimmed = email.trim()
    if (!trimmed) {
      clearFieldError('email')
      return
    }
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }))
    } else {
      clearFieldError('email')
    }
  }

  const isLoginSubmitEnabled = !validateEmail(email) && password.trim().length > 0

  const isSignupAccountReady =
    !validateEmail(email) &&
    nickname.trim().length >= 2 &&
    nickname.trim().length <= 20 &&
    password.length >= 8 &&
    password === confirmPassword

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

  const validateSignupAccount = () => {
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
    setLoginAuthError(null)
    if (!validateLogin()) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(onLogin(email.trim(), password))
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.'
      if (isLoginCredentialError(message)) {
        setLoginAuthError(LOGIN_AUTH_ERROR_MESSAGE)
        passwordRef.current?.focus()
      } else {
        setLoginAuthError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToWatchlistStep = () => {
    setFormMessage(null)
    setStepError(null)
    if (!validateSignupAccount()) return
    setSignupStep(2)
  }

  const goToAlertsStep = () => {
    setStepError(null)
    setSignupStep(3)
  }

  const finishRegistration = async () => {
    setIsSubmitting(true)
    setSignupSubmitError(null)
    setStepError(null)
    try {
      await Promise.resolve(
        onCompleteRegistration({
          email: email.trim(),
          password,
          nickname: nickname.trim(),
          watchlist: watchlistSelection,
          alertSettings,
        }),
      )
      setPassword('')
      setConfirmPassword('')
      setNickname('')
      resetSignupFlow()
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.'
      if (isEmailDuplicateError(message)) {
        setSignupStep(1)
        setErrors({ email: message })
        emailRef.current?.focus()
        return
      }
      if (signupStep === 3) {
        setSignupSubmitError(message)
      } else {
        setStepError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardClass = [
    styles.card,
    signupStep === 2 && styles.cardExpanded,
    signupStep === 3 && styles.cardAlerts,
  ]
    .filter(Boolean)
    .join(' ')
  const pageClass = [styles.page, isSignupMultiStep ? styles.pageSignup : ''].filter(Boolean).join(' ')

  return (
    <div className={pageClass}>
      <main className={cardClass}>
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
          <p className={styles.formSuccess} role="status">
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
                setLoginAuthError(null)
              }}
              placeholder="이메일 주소 입력..."
              type="email"
              error={errors.email}
              invalid={Boolean(loginAuthError)}
              inputRef={emailRef}
              autoComplete="email"
              onBlur={handleEmailBlur}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                const emailError = validateEmail(email)
                if (emailError) {
                  setErrors((prev) => ({ ...prev, email: emailError }))
                  return
                }
                clearFieldError('email')
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
                setLoginAuthError(null)
              }}
              placeholder="비밀번호 입력..."
              type="password"
              error={errors.password}
              invalid={Boolean(loginAuthError)}
              inputRef={passwordRef}
              autoComplete="current-password"
              showToggle
              visible={passwordVisible}
              onToggleVisible={() => setPasswordVisible((v) => !v)}
            />
            <div className={styles.loginPasswordMeta}>
              {loginAuthError ? (
                <p className={styles.formAuthError} role="alert">
                  {loginAuthError}
                </p>
              ) : null}
              <div className={styles.forgotRow}>
                <button type="button" className={styles.forgotLink}>
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting || !isLoginSubmitEnabled}
              aria-busy={isSubmitting}
              data-loading={isSubmitting ? 'true' : 'false'}
            >
              <span className={styles.submitLabel}>로그인</span>
              {isSubmitting ? <ButtonSpinner /> : null}
            </button>
          </form>
        ) : (
          <div className={styles.signupFlow}>
            {signupStep === 1 ? (
              <form id={`${formId}-signup`} className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
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
                  onBlur={handleEmailBlur}
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
                  type="button"
                  className={styles.submit}
                  onClick={goToWatchlistStep}
                  disabled={!isSignupAccountReady}
                >
                  다음
                </button>
              </form>
            ) : null}

            {signupStep === 2 ? (
              <div className={styles.signupStep}>
                <SignupWatchlistStep
                  selected={watchlistSelection}
                  onSelectedChange={setWatchlistSelection}
                  error={stepError}
                  onError={setStepError}
                />
                <div className={`${styles.signupFooter} ${styles.signupFooterCompact}`}>
                  <button type="button" className={styles.submit} onClick={goToAlertsStep}>
                    {watchlistSelection.length === 0 ? '건너뛰기' : '다음'}
                  </button>
                </div>
              </div>
            ) : null}

            {signupStep === 3 ? (
              <div className={styles.signupStep}>
                <SignupAlertsStep
                  settings={alertSettings}
                  onSettingsChange={(next) => {
                    setAlertSettings(next)
                    setSignupSubmitError(null)
                  }}
                />
                {signupSubmitError ? (
                  <p className={styles.formAuthError} role="alert">
                    {signupSubmitError}
                  </p>
                ) : null}
                <div className={`${styles.signupFooter} ${styles.signupFooterSingle}`}>
                  <button
                    type="button"
                    className={styles.submit}
                    onClick={finishRegistration}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    data-loading={isSubmitting ? 'true' : 'false'}
                  >
                    <span className={styles.submitLabel}>MarketLens 시작하기</span>
                    {isSubmitting ? <ButtonSpinner /> : null}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
