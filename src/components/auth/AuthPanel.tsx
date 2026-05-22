import {
  useId,
  useRef,
  useState,
  type Dispatch,
  type FocusEventHandler,
  type FormEvent,
  type KeyboardEventHandler,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  checkEmailAvailability,
  checkNicknameAvailability,
  createPendingSignup,
  resetPassword,
  sendEmailVerification,
  sendSignupEmailVerification,
} from '../../data/clients/authClient'
import type { EmailVerificationPurpose } from '../../data/types/auth'
import type { CompleteRegistrationInput } from '../../data/clients/completeRegistration'
import { getApiErrorMessage, parseApiFieldError } from '../../data/util/apiError'
import type { AlertSettings } from '../../data/types/member'
import type { WatchlistItem } from '../../store/watchlistStore'
import { ButtonSpinner } from '../ui/ButtonSpinner'
import { IconCircleButton } from '../ui/IconCircleButton'
import { AuthPasswordVisibilityToggle } from './AuthPasswordVisibilityToggle'
import { DEFAULT_ALERT_SETTINGS, SignupAlertsStep } from './SignupAlertsStep'
import { AuthEmailVerifyModal } from './AuthEmailVerifyModal'
import { SignupWatchlistStep } from './SignupWatchlistStep'
import styles from './AuthPanel.module.css'

export type AuthMode = 'login' | 'signup'

type SignupStep = 1 | 2 | 3

export interface SignupAccountDraft {
  email: string
  password: string
  nickname: string
  pendingSignupToken: string
}

export interface AuthPanelProps {
  presentation?: 'page' | 'modal'
  /** account-only: 로그인·회원가입 1단계만. full: 관심종목·알림까지 (/login 직접 접근) */
  scope?: 'account-only' | 'full'
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onLogin: (email: string, password: string) => void | Promise<void>
  onCompleteRegistration: (input: CompleteRegistrationInput) => void | Promise<void>
  /** scope=account-only 일 때 회원가입 「다음」 */
  onSignupAccountNext?: (draft: SignupAccountDraft) => void
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

function isNicknameDuplicateError(message: string) {
  return message.includes('이미 사용 중인 닉네임')
}

function isMemberNotFoundError(message: string) {
  return message.includes('존재하지 않는 회원')
}

type LoginPhase = 'signin' | 'forgot'

function applySignupApiError(
  rawMessage: string,
  setErrors: Dispatch<SetStateAction<FieldErrors>>,
  setSignupSubmitError: Dispatch<SetStateAction<string | null>>,
) {
  const { field, message } = parseApiFieldError(rawMessage)
  setSignupSubmitError(null)
  if (field === 'email') {
    setErrors({ email: message })
    return 'email' as const
  }
  if (field === 'nickname') {
    setErrors({ nickname: message })
    return 'nickname' as const
  }
  if (field === 'password') {
    setErrors({ password: message })
    return 'password' as const
  }
  setSignupSubmitError(message)
  return null
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable'

export function AuthField({
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
  trailingAction,
  disabled,
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
  trailingAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    busy?: boolean
    done?: boolean
  }
  disabled?: boolean
}) {
  const messageId = `${id}-error`
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type
  const hasInputError = invalid || Boolean(error)
  const showMessage = Boolean(error)
  const hasTrailingAction = Boolean(trailingAction)

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          id={id}
          className={[
            styles.input,
            showToggle ? styles.inputWithToggle : '',
            hasTrailingAction ? styles.inputWithAction : '',
            hasInputError ? styles.inputError : '',
            disabled ? styles.inputDisabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={inputType}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasInputError}
          aria-describedby={showMessage ? messageId : undefined}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
        {trailingAction ? (
          <button
            type="button"
            className={`${styles.fieldAction} ${trailingAction.done ? styles.fieldActionDone : ''}`.trim()}
            onClick={trailingAction.onClick}
            disabled={disabled || trailingAction.disabled || trailingAction.busy}
            aria-busy={trailingAction.busy}
          >
            {trailingAction.busy ? <ButtonSpinner /> : trailingAction.label}
          </button>
        ) : null}
        {showToggle && onToggleVisible && !disabled ? (
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

export default function AuthPanel({
  presentation = 'page',
  scope = 'full',
  mode,
  onModeChange,
  onLogin,
  onCompleteRegistration,
  onSignupAccountNext,
}: AuthPanelProps) {
  const formId = useId()
  const [emailCheckStatus, setEmailCheckStatus] = useState<AvailabilityStatus>('idle')
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<AvailabilityStatus>('idle')
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailVerifyModalOpen, setEmailVerifyModalOpen] = useState(false)
  const [emailVerifyPurpose, setEmailVerifyPurpose] = useState<EmailVerificationPurpose>('SIGNUP')
  const [loginPhase, setLoginPhase] = useState<LoginPhase>('signin')
  const [passwordResetVerified, setPasswordResetVerified] = useState(false)
  const [pendingSignupToken, setPendingSignupToken] = useState<string | null>(null)
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

  const isAccountOnly = scope === 'account-only'
  const isSignupMultiStep = !isAccountOnly && mode === 'signup' && signupStep > 1

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
    setEmailCheckStatus('idle')
    setNicknameCheckStatus('idle')
    setEmailVerified(false)
    setEmailVerifyModalOpen(false)
    setEmailVerifyPurpose('SIGNUP')
    setPendingSignupToken(null)
    setSignupStep(1)
    setWatchlistSelection([])
    setAlertSettings(DEFAULT_ALERT_SETTINGS)
    setStepError(null)
    setSignupSubmitError(null)
  }

  const resetLoginForgotFlow = () => {
    setLoginPhase('signin')
    setPasswordResetVerified(false)
    setPassword('')
    setConfirmPassword('')
    setPasswordVisible(false)
    setConfirmVisible(false)
    setEmailVerifyPurpose('SIGNUP')
    setEmailVerifyModalOpen(false)
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
    resetLoginForgotFlow()
    onModeChange(next)
  }

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return '이메일을 입력해주세요.'
    if (trimmed.includes('..')) return '올바른 이메일 형식을 입력해주세요.'
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
      const message = getApiErrorMessage(error, '로그인에 실패했습니다.')
      if (isLoginCredentialError(message)) {
        setErrors({})
        setLoginAuthError(LOGIN_AUTH_ERROR_MESSAGE)
        passwordRef.current?.focus()
      } else {
        const field = applySignupApiError(message, setErrors, setLoginAuthError)
        if (field === 'email') {
          emailRef.current?.focus()
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetEmailCheckState = () => {
    setEmailCheckStatus('idle')
    setEmailVerified(false)
    setPendingSignupToken(null)
    setEmailVerifyModalOpen(false)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.nickname
      delete next.password
      delete next.confirmPassword
      return next
    })
  }

  const resetNicknameCheckState = () => {
    setNicknameCheckStatus('idle')
  }

  const handleCheckNicknameDuplicate = async () => {
    const nick = nickname.trim()
    if (nick.length < 2 || nick.length > 20) {
      setErrors({ nickname: '닉네임은 2~20자로 입력해주세요.' })
      nicknameRef.current?.focus()
      return
    }
    clearFieldError('nickname')
    setSignupSubmitError(null)
    setNicknameCheckStatus('checking')
    try {
      const available = await checkNicknameAvailability(nick)
      setNicknameCheckStatus(available ? 'available' : 'unavailable')
      if (!available) {
        setErrors({ nickname: '이미 사용 중인 닉네임입니다.' })
        nicknameRef.current?.focus()
      }
    } catch (error) {
      setNicknameCheckStatus('idle')
      const message = getApiErrorMessage(error, '닉네임 확인에 실패했습니다.')
      if (isNicknameDuplicateError(message)) {
        setErrors({ nickname: message })
        setNicknameCheckStatus('unavailable')
      } else {
        applySignupApiError(message, setErrors, setSignupSubmitError)
      }
    }
  }

  const handleOpenEmailVerification = async () => {
    if (emailVerified) return
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }))
      emailRef.current?.focus()
      return
    }

    setSignupSubmitError(null)
    setIsSubmitting(true)
    try {
      if (emailCheckStatus !== 'available') {
        const available = await checkEmailAvailability(email.trim())
        if (!available) {
          setEmailCheckStatus('unavailable')
          setErrors({ email: '이미 사용 중인 이메일입니다.' })
          emailRef.current?.focus()
          return
        }
        setEmailVerified(false)
        setPendingSignupToken(null)
        setEmailCheckStatus('available')
      }

      setEmailVerifyPurpose('SIGNUP')
      await sendSignupEmailVerification(email.trim())
      setEmailVerifyModalOpen(true)
    } catch (error) {
      const message = getApiErrorMessage(error, '인증 메일 발송에 실패했습니다.')
      if (isEmailDuplicateError(message)) {
        setErrors({ email: message })
        setEmailCheckStatus('unavailable')
        emailRef.current?.focus()
        return
      }
      const field = applySignupApiError(message, setErrors, setSignupSubmitError)
      if (field === 'email') {
        setEmailCheckStatus('idle')
        emailRef.current?.focus()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailVerified = () => {
    setEmailVerified(true)
    setEmailVerifyModalOpen(false)
    window.requestAnimationFrame(() => nicknameRef.current?.focus())
  }

  const startForgotPassword = () => {
    setLoginAuthError(null)
    setSignupSubmitError(null)
    setFormMessage(null)
    setErrors({})
    setPassword('')
    setConfirmPassword('')
    setPasswordResetVerified(false)
    setLoginPhase('forgot')
  }

  const exitForgotPassword = () => {
    resetLoginForgotFlow()
    setErrors({})
    setLoginAuthError(null)
    setSignupSubmitError(null)
  }

  const handleOpenPasswordResetVerification = async () => {
    if (passwordResetVerified) return
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }))
      emailRef.current?.focus()
      return
    }

    setSignupSubmitError(null)
    setIsSubmitting(true)
    try {
      setEmailVerifyPurpose('PASSWORD_RESET')
      await sendEmailVerification(email.trim(), 'PASSWORD_RESET')
      setEmailVerifyModalOpen(true)
    } catch (error) {
      const message = getApiErrorMessage(error, '인증 메일 발송에 실패했습니다.')
      if (isMemberNotFoundError(message)) {
        setErrors({ email: message })
        emailRef.current?.focus()
        return
      }
      const field = applySignupApiError(message, setErrors, setSignupSubmitError)
      if (field === 'email') {
        emailRef.current?.focus()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordResetEmailVerified = () => {
    setPasswordResetVerified(true)
    setEmailVerifyModalOpen(false)
    setPassword('')
    setConfirmPassword('')
    window.requestAnimationFrame(() => passwordRef.current?.focus())
  }

  const handleEmailVerifiedFromModal = () => {
    if (emailVerifyPurpose === 'PASSWORD_RESET') {
      handlePasswordResetEmailVerified()
      return
    }
    handleEmailVerified()
  }

  const validatePasswordReset = () => {
    const next: FieldErrors = {}
    if (password.length < 8) {
      next.password = '비밀번호는 8자 이상이어야 합니다.'
    }
    if (password !== confirmPassword) {
      next.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }
    setErrors(next)
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

  const handlePasswordResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!passwordResetVerified) {
      setSignupSubmitError('이메일 인증을 완료해주세요.')
      emailRef.current?.focus()
      return
    }
    setSignupSubmitError(null)
    if (!validatePasswordReset()) return

    setIsSubmitting(true)
    try {
      await resetPassword({ email: email.trim(), newPassword: password })
      setFormMessage({ type: 'success', text: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.' })
      resetLoginForgotFlow()
    } catch (error) {
      const message = getApiErrorMessage(error, '비밀번호 변경에 실패했습니다.')
      if (message.includes('이메일 인증이 완료되지 않았습니다') || message.includes('비밀번호 재설정')) {
        setPasswordResetVerified(false)
        setSignupSubmitError(message)
        emailRef.current?.focus()
        return
      }
      applySignupApiError(message, setErrors, setSignupSubmitError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordResetEmailTrailingAction = {
    label: passwordResetVerified ? '인증 완료' : '인증',
    onClick: () => void handleOpenPasswordResetVerification(),
    disabled: passwordResetVerified || isSubmitting || !email.trim(),
    busy: isSubmitting,
    done: passwordResetVerified,
  }

  const isPasswordResetSubmitEnabled =
    passwordResetVerified && password.length >= 8 && password === confirmPassword

  const goToSignupNextStep = async () => {
    setFormMessage(null)
    setStepError(null)
    setSignupSubmitError(null)
    if (!validateSignupAccount()) return
    if (!emailVerified) {
      setSignupSubmitError('이메일 인증을 완료해주세요.')
      return
    }
    if (nicknameCheckStatus !== 'available') {
      setErrors({ nickname: '닉네임 중복 확인을 해주세요.' })
      nicknameRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const { pendingSignupToken: token } = await createPendingSignup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      })
      setPendingSignupToken(token)

      const draft: SignupAccountDraft = {
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        pendingSignupToken: token,
      }

      if (isAccountOnly) {
        onSignupAccountNext?.(draft)
        return
      }
      setSignupStep(2)
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입 준비에 실패했습니다.'
      if (message.includes('이메일 인증이 완료되지 않았습니다')) {
        setEmailVerified(false)
        setSignupSubmitError(message)
        return
      }
      if (message.includes('password') || message.includes('비밀번호')) {
        setErrors({ password: '비밀번호는 8자 이상이어야 합니다.' })
        passwordRef.current?.focus()
        return
      }
      setSignupSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailTrailingLabel = emailVerified ? '인증 완료' : '인증'

  const emailTrailingAction = {
    label: emailTrailingLabel,
    onClick: () => void handleOpenEmailVerification(),
    disabled: emailVerified || isSubmitting || !email.trim(),
    busy: isSubmitting,
    done: emailVerified,
  }

  const signupFieldsLocked = !emailVerified

  const nicknameTrailingAction = {
    label: nicknameCheckStatus === 'available' ? '사용 가능' : '중복 확인',
    onClick: () => void handleCheckNicknameDuplicate(),
    disabled:
      signupFieldsLocked ||
      nicknameCheckStatus === 'available' ||
      nicknameCheckStatus === 'checking' ||
      !nickname.trim(),
    busy: nicknameCheckStatus === 'checking',
    done: nicknameCheckStatus === 'available',
  }

  const goToAlertsStep = () => {
    setStepError(null)
    setSignupStep(3)
  }

  const finishRegistration = async () => {
    if (!pendingSignupToken) {
      setSignupSubmitError('이메일 인증을 먼저 완료해주세요.')
      setSignupStep(1)
      return
    }
    setIsSubmitting(true)
    setSignupSubmitError(null)
    setStepError(null)
    try {
      await Promise.resolve(
        onCompleteRegistration({
          pendingSignupToken,
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

  const isModal = presentation === 'modal'
  const cardClass = [
    styles.card,
    isModal && styles.cardInModal,
    !isModal && signupStep === 2 && styles.cardExpanded,
    !isModal && signupStep === 3 && styles.cardAlerts,
  ]
    .filter(Boolean)
    .join(' ')
  const pageClass = [
    styles.page,
    isModal && styles.pageInModal,
    !isModal && isSignupMultiStep && styles.pageSignup,
  ]
    .filter(Boolean)
    .join(' ')

  const panel = (
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
          loginPhase === 'signin' ? (
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
                invalid={Boolean(errors.email)}
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
              <div className={styles.loginPasswordMeta}>
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
                  error={errors.password || (loginAuthError && !errors.email ? loginAuthError : undefined)}
                  invalid={Boolean(errors.password || loginAuthError)}
                  inputRef={passwordRef}
                  autoComplete="current-password"
                  showToggle
                  visible={passwordVisible}
                  onToggleVisible={() => setPasswordVisible((v) => !v)}
                />
                <p className={styles.forgotRow}>
                  <button type="button" className={styles.forgotLink} onClick={startForgotPassword}>
                    비밀번호를 잊으셨나요?
                  </button>
                </p>
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
            <form
              id={`${formId}-forgot`}
              className={styles.form}
              onSubmit={handlePasswordResetSubmit}
              noValidate
            >
              <div className={styles.forgotIntro}>
                <IconCircleButton
                  direction="back"
                  surface="modal"
                  aria-label="로그인으로 돌아가기"
                  onClick={exitForgotPassword}
                />
                <p className={styles.forgotLead}>
                  가입한 이메일로 인증 후
                  <br />
                  새 비밀번호를 설정할 수 있습니다.
                </p>
              </div>
              <AuthField
                id="auth-forgot-email"
                label="이메일 주소"
                value={email}
                onChange={(value) => {
                  setEmail(value)
                  clearFieldError('email')
                  setSignupSubmitError(null)
                  if (passwordResetVerified) {
                    setPasswordResetVerified(false)
                  }
                }}
                placeholder="이메일 주소 입력..."
                type="email"
                error={errors.email}
                invalid={Boolean(errors.email)}
                inputRef={emailRef}
                autoComplete="email"
                onBlur={handleEmailBlur}
                trailingAction={passwordResetEmailTrailingAction}
                disabled={passwordResetVerified}
              />
              <AuthField
                id="auth-reset-password"
                label="새 비밀번호"
                value={password}
                onChange={(value) => {
                  setPassword(value)
                  clearFieldError('password')
                  syncPasswordMatch(value, confirmPassword)
                }}
                placeholder="8자 이상 입력..."
                type="password"
                error={errors.password}
                invalid={Boolean(errors.password)}
                inputRef={passwordRef}
                autoComplete="new-password"
                showToggle
                visible={passwordVisible}
                onToggleVisible={() => setPasswordVisible((v) => !v)}
                disabled={!passwordResetVerified}
              />
              <AuthField
                id="auth-reset-confirm"
                label="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value)
                  syncPasswordMatch(password, value)
                }}
                placeholder="비밀번호 다시 입력..."
                type="password"
                error={errors.confirmPassword}
                invalid={Boolean(errors.confirmPassword)}
                inputRef={confirmRef}
                autoComplete="new-password"
                showToggle
                visible={confirmVisible}
                onToggleVisible={() => setConfirmVisible((v) => !v)}
                disabled={!passwordResetVerified}
              />
              {signupSubmitError ? (
                <p className={styles.formBanner} role="alert">
                  {signupSubmitError}
                </p>
              ) : null}
              <button
                type="submit"
                className={styles.submit}
                disabled={isSubmitting || !isPasswordResetSubmitEnabled}
                aria-busy={isSubmitting}
                data-loading={isSubmitting ? 'true' : 'false'}
              >
                <span className={styles.submitLabel}>비밀번호 변경</span>
                {isSubmitting ? <ButtonSpinner /> : null}
              </button>
            </form>
          )
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
                    resetEmailCheckState()
                  }}
                  placeholder="이메일 주소 입력..."
                  type="email"
                  error={errors.email}
                  inputRef={emailRef}
                  autoComplete="email"
                  onBlur={handleEmailBlur}
                  trailingAction={emailTrailingAction}
                  disabled={emailVerified}
                />
                <AuthField
                  id="auth-signup-nickname"
                  label="닉네임"
                  value={nickname}
                  onChange={(value) => {
                    setNickname(value)
                    clearFieldError('nickname')
                    resetNicknameCheckState()
                  }}
                  placeholder={signupFieldsLocked ? '이메일 인증 후 입력' : '닉네임 입력 (2~20자)'}
                  error={signupFieldsLocked ? undefined : errors.nickname}
                  inputRef={nicknameRef}
                  autoComplete="nickname"
                  trailingAction={nicknameTrailingAction}
                  disabled={signupFieldsLocked}
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
                  placeholder={signupFieldsLocked ? '이메일 인증 후 입력' : '8자 이상 입력...'}
                  type="password"
                  error={signupFieldsLocked ? undefined : errors.password}
                  inputRef={passwordRef}
                  autoComplete="new-password"
                  showToggle
                  visible={passwordVisible}
                  onToggleVisible={() => setPasswordVisible((v) => !v)}
                  disabled={signupFieldsLocked}
                />
                <AuthField
                  id="auth-signup-confirm"
                  label="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value)
                    syncPasswordMatch(password, value)
                  }}
                  placeholder={signupFieldsLocked ? '이메일 인증 후 입력' : '비밀번호 다시 입력...'}
                  type="password"
                  error={signupFieldsLocked ? undefined : errors.confirmPassword}
                  inputRef={confirmRef}
                  autoComplete="new-password"
                  showToggle
                  visible={confirmVisible}
                  onToggleVisible={() => setConfirmVisible((v) => !v)}
                  disabled={signupFieldsLocked}
                />
                {signupSubmitError ? (
                  <p className={styles.formAuthError} role="alert">
                    {signupSubmitError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className={styles.submit}
                  onClick={() => void goToSignupNextStep()}
                  disabled={!isSignupAccountReady || isSubmitting || !emailVerified}
                  aria-busy={isSubmitting}
                  data-loading={isSubmitting ? 'true' : 'false'}
                >
                  <span className={styles.submitLabel}>다음</span>
                  {isSubmitting ? <ButtonSpinner /> : null}
                </button>
              </form>
            ) : null}

            {!isAccountOnly && signupStep === 2 ? (
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

            {!isAccountOnly && signupStep === 3 ? (
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
  )

  const content = (
    <>
      {panel}
      <AuthEmailVerifyModal
        isOpen={emailVerifyModalOpen}
        email={email.trim()}
        purpose={emailVerifyPurpose}
        onClose={() => setEmailVerifyModalOpen(false)}
        onVerified={handleEmailVerifiedFromModal}
      />
    </>
  )

  if (isModal) return content

  return <div className={pageClass}>{content}</div>
}
