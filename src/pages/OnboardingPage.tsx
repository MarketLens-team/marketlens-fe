import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { SignupAccountDraft } from '../components/auth/AuthPanel'
import { DEFAULT_ALERT_SETTINGS, SignupAlertsStep } from '../components/auth/SignupAlertsStep'
import { SignupTelegramLinkStep } from '../components/auth/SignupTelegramLinkStep'
import { OnboardingFloatField } from '../components/auth/OnboardingFloatField'
import { SignupWatchlistStep } from '../components/auth/SignupWatchlistStep'
import { ButtonSpinner } from '../components/ui/ButtonSpinner'
import { PillButton } from '../components/ui/PillButton'
import { completeRegistration } from '../data/clients/completeRegistration'
import type { AlertSettings } from '../data/types/member'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore } from '../store/authStore'
import type { WatchlistItem } from '../data/types/watchlist'
import { clearAuthRedirect } from '../services/authRedirect'
import styles from './OnboardingPage.module.css'

type OnboardingPhase = 'watchlist' | 'alerts' | 'telegram'

function readAccountDraft(state: unknown): SignupAccountDraft | null {
  if (typeof state !== 'object' || state === null || !('accountDraft' in state)) return null
  const draft = (state as { accountDraft?: unknown }).accountDraft
  if (
    typeof draft !== 'object' ||
    draft === null ||
    typeof (draft as SignupAccountDraft).email !== 'string' ||
    typeof (draft as SignupAccountDraft).password !== 'string' ||
    typeof (draft as SignupAccountDraft).nickname !== 'string' ||
    typeof (draft as SignupAccountDraft).pendingSignupToken !== 'string'
  ) {
    return null
  }
  return draft as SignupAccountDraft
}

function StepIndicator({ phase }: { phase: OnboardingPhase }) {
  const showTelegramStep = phase === 'telegram'

  return (
    <div className={styles.stepper} aria-label="온보딩 단계">
      <div
        className={styles.stepItem}
        data-active={phase === 'watchlist' ? 'true' : 'false'}
        aria-current={phase === 'watchlist' ? 'step' : undefined}
      >
        <span className={styles.stepDot} aria-hidden>1</span>
        <span className={styles.stepLabel}>관심 종목</span>
      </div>
      <div className={styles.stepLine} aria-hidden />
      <div
        className={styles.stepItem}
        data-active={phase === 'alerts' ? 'true' : 'false'}
        aria-current={phase === 'alerts' ? 'step' : undefined}
      >
        <span className={styles.stepDot} aria-hidden>2</span>
        <span className={styles.stepLabel}>알림 설정</span>
      </div>
      {showTelegramStep ? (
        <>
          <div className={styles.stepLine} aria-hidden />
          <div
            className={styles.stepItem}
            data-active="true"
            aria-current="step"
          >
            <span className={styles.stepDot} aria-hidden>3</span>
            <span className={styles.stepLabel}>텔레그램 연동</span>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function OnboardingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const openAuthModal = useAuthModalStore((s) => s.open)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const role = useAuthStore((state) => state.role)

  const accountDraft = readAccountDraft(location.state)
  const [phase, setPhase] = useState<OnboardingPhase>('watchlist')
  const [watchlistSelection, setWatchlistSelection] = useState<WatchlistItem[]>([])
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS)
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [telegramLinkHint, setTelegramLinkHint] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const goHome = () => {
    clearAuthRedirect()
    useAuthModalStore.getState().close()
    navigate('/', { replace: true, state: undefined })
  }

  if (isLoggedIn && phase !== 'telegram') {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  if (!accountDraft) {
    return (
      <div className={styles.page}>
        <div className={styles.missing}>
          <p>회원가입을 이어하려면 계정 정보가 필요합니다.</p>
          <div className={styles.missingActions}>
            <PillButton variant="secondary" onClick={() => openAuthModal()}>
              로그인
            </PillButton>
            <PillButton variant="primary" onClick={() => openAuthModal('signup')}>
              회원 가입
            </PillButton>
          </div>
        </div>
      </div>
    )
  }

  const finishRegistration = async () => {
    const goTelegram = alertSettings.telegramNotificationEnabled
    if (goTelegram) {
      setPhase('telegram')
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setTelegramLinkHint(null)
    try {
      await completeRegistration({
        pendingSignupToken: accountDraft.pendingSignupToken,
        watchlist: watchlistSelection,
        alertSettings,
      })

      if (!goTelegram) {
        goHome()
      }
    } catch (error) {
      if (goTelegram) {
        setPhase('alerts')
      }
      setSubmitError(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (phase === 'telegram') {
    return (
      <div className={styles.page}>
        <OnboardingFloatField occluderRef={cardRef} />
        <div className={`${styles.shell} ${styles.shellNarrow}`}>
          <div ref={cardRef} className={styles.card}>
            <StepIndicator phase="telegram" />
            {isSubmitting ? (
              <p className={styles.hint} aria-busy="true">
                가입을 마무리하는 중입니다…
              </p>
            ) : (
              <SignupTelegramLinkStep
                onLinkOpened={() => {
                  setTelegramLinkHint(
                    '브라우저에서 Telegram 열기를 허용한 뒤, 봇 채팅에서 시작(Start)을 눌러 연동을 완료해 주세요.',
                  )
                }}
                onLinkError={(message) => setTelegramLinkHint(message)}
              />
            )}
            {telegramLinkHint ? (
              <p className={styles.hint} role="status">
                {telegramLinkHint}
              </p>
            ) : null}
            <div className={styles.telegramFooter}>
              <button type="button" className={styles.skipBtn} disabled={isSubmitting} onClick={goHome}>
                나중에 하기
              </button>
              <button type="button" className={styles.submit} disabled={isSubmitting} onClick={goHome}>
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'alerts') {
    return (
      <div className={styles.page}>
        <OnboardingFloatField occluderRef={cardRef} />
        <div className={`${styles.shell} ${styles.shellNarrow}`}>
          <div ref={cardRef} className={styles.card}>
            <StepIndicator phase="alerts" />
            <SignupAlertsStep settings={alertSettings} onSettingsChange={setAlertSettings} />
            {submitError ? (
              <p className={styles.error} role="alert">
                {submitError}
              </p>
            ) : null}
            <button
              type="button"
              className={`${styles.submit} ${styles.submitWide}`}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={() => void finishRegistration()}
            >
              {isSubmitting ? <ButtonSpinner /> : 'MarketLens 시작하기'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const goToAlerts = () => {
    setStepError(null)
    setPhase('alerts')
  }

  return (
    <div className={styles.page}>
      <OnboardingFloatField occluderRef={cardRef} />
      <div className={styles.shell}>
        <div ref={cardRef} className={`${styles.card} ${styles.cardFill}`}>
          <StepIndicator phase="watchlist" />
          <div className={styles.stepBody}>
            <SignupWatchlistStep
              selected={watchlistSelection}
              onSelectedChange={setWatchlistSelection}
              error={stepError}
              onError={setStepError}
            />
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.skipBtn} onClick={goToAlerts}>
              건너뛰기
            </button>
            <button
              type="button"
              className={styles.submit}
              disabled={watchlistSelection.length === 0}
              onClick={goToAlerts}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
