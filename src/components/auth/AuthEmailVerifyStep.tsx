import { useState } from 'react'
import {
  confirmSignupEmailVerification,
  sendSignupEmailVerification,
} from '../../data/clients/authClient'
import { useResendCooldown } from '../../hooks/useResendCooldown'
import { ButtonSpinner } from '../ui/ButtonSpinner'
import { OtpCodeInput } from './OtpCodeInput'
import styles from './AuthEmailVerifyStep.module.css'

export interface AuthEmailVerifyStepProps {
  email: string
  onBack: () => void
  onVerified: () => void | Promise<void>
  showTopBar?: boolean
  initialCodeExpanded?: boolean
}

function EnvelopeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m3.5 8 8.2 5.4a1 1 0 0 0 1.1 0L20.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={expanded ? styles.chevronExpanded : styles.chevron}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AuthEmailVerifyStep({
  email,
  onBack,
  onVerified,
  showTopBar = true,
  initialCodeExpanded = false,
}: AuthEmailVerifyStepProps) {
  const { canResend, formatted, restart } = useResendCooldown(60)
  const [codeExpanded, setCodeExpanded] = useState(initialCodeExpanded)
  const [code, setCode] = useState('')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode)
    setVerifyError(null)
    if (nextCode.length === 6 && !isVerifying) {
      void submitCode(nextCode)
    }
  }

  const submitCode = async (nextCode: string) => {
    setIsVerifying(true)
    setVerifyError(null)
    try {
      await confirmSignupEmailVerification({ email, code: nextCode })
      await Promise.resolve(onVerified())
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : '이메일 인증에 실패했습니다.')
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || isResending) return
    setIsResending(true)
    setResendError(null)
    setVerifyError(null)
    try {
      await sendSignupEmailVerification(email)
      restart()
      setCode('')
    } catch (error) {
      setResendError(error instanceof Error ? error.message : '인증 메일 재발송에 실패했습니다.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={styles.step}>
      {showTopBar ? (
        <div className={styles.topBar}>
          <button type="button" className={styles.iconButton} onClick={onBack} aria-label="이전 단계">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}

      <div className={styles.hero}>
        <div className={styles.iconBadge}>
          <EnvelopeIcon />
        </div>
        <h2 className={styles.title}>이메일 인증</h2>
        <p className={styles.lead}>
          <strong>{email}</strong>로 인증 메일을 보냈습니다. 메일 안의 버튼을 누르거나 아래 인증 코드를 입력해 주세요.
        </p>
        <button
          type="button"
          className={styles.codeToggle}
          onClick={() => setCodeExpanded((expanded) => !expanded)}
          aria-expanded={codeExpanded}
        >
          검증 코드 입력하기
          <ChevronIcon expanded={codeExpanded} />
        </button>
      </div>

      {codeExpanded ? (
        <div className={styles.codeSection}>
          <OtpCodeInput value={code} onChange={handleCodeChange} disabled={isVerifying} error={verifyError} />
          {isVerifying ? (
            <p className={styles.verifying} aria-live="polite">
              <ButtonSpinner />
              <span>인증 확인 중...</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.footer}>
        {resendError ? (
          <p className={styles.footerError} role="alert">
            {resendError}
          </p>
        ) : null}
        {canResend ? (
          <button
            type="button"
            className={styles.resendButton}
            onClick={() => void handleResend()}
            disabled={isResending}
            aria-busy={isResending}
          >
            {isResending ? <ButtonSpinner /> : '이메일 재전송'}
          </button>
        ) : (
          <p className={styles.countdown}>
            메일이 오지 않으면 <strong>{formatted}</strong> 후 재전송할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  )
}
