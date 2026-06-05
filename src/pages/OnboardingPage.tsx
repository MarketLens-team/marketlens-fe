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
import { fetchAlertSettings, syncAlertSettingsIfNeeded, updateAlertSettings } from '../data/clients/memberClient'
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

function StepIndicator({
  phase,
  upcomingTelegramStep = false,
}: {
  phase: OnboardingPhase
  upcomingTelegramStep?: boolean
}) {
  const showTelegramStep = phase === 'telegram' || upcomingTelegramStep

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
            data-active={phase === 'telegram' ? 'true' : 'false'}
            data-upcoming={phase === 'alerts' && upcomingTelegramStep ? 'true' : 'false'}
            aria-current={phase === 'telegram' ? 'step' : undefined}
          >
            <span className={styles.stepDot} aria-hidden>3</span>
            <span className={styles.stepLabel}>텔레그램 연동</span>
          </div>
        </>
      ) : null}
    </div>
  )
}

interface OnboardingBackButtonProps {
  label?: string
  onClick: () => void
  disabled?: boolean
}

function OnboardingBackButton({ label = '이전', onClick, disabled = false }: OnboardingBackButtonProps) {
  return (
    <button
      type="button"
      className={styles.backBtn}
      disabled={disabled}
      aria-label={`${label} 단계로 돌아가기`}
      onClick={onClick}
    >
      <span className={styles.backIcon} aria-hidden>
        ←
      </span>
      {label}
    </button>
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
  const [registrationDone, setRegistrationDone] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const goHome = () => {
    clearAuthRedirect()
    useAuthModalStore.getState().close()
    navigate('/', { replace: true, state: undefined })
  }

  const finishOnboardingFromTelegramStep = async () => {
    setIsSubmitting(true)
    setTelegramLinkHint(null)
    try {
      const settings = await fetchAlertSettings()
      await syncAlertSettingsIfNeeded(settings)
      goHome()
    } catch (error) {
      setTelegramLinkHint(
        error instanceof Error ? error.message : '알림 설정을 저장하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoggedIn && phase === 'watchlist') {
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

    if (registrationDone) {
      setIsSubmitting(true)
      setSubmitError(null)
      setTelegramLinkHint(null)
      try {
        await updateAlertSettings(alertSettings)
        if (goTelegram) {
          setPhase('telegram')
        } else {
          const settings = await fetchAlertSettings()
          await syncAlertSettingsIfNeeded(settings)
          goHome()
        }
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '알림 설정 저장에 실패했습니다.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

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
      setRegistrationDone(true)

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

  const goToWatchlist = () => {
    setSubmitError(null)
    setPhase('watchlist')
  }

  const goToAlertsFromTelegram = () => {
    setTelegramLinkHint(null)
    setSubmitError(null)
    setPhase('alerts')
  }

  const goTelegramAfterSignup = alertSettings.telegramNotificationEnabled
  const alertsSubmitLabel = registrationDone
    ? goTelegramAfterSignup
      ? '텔레그램 연동 계속'
      : 'MarketLens 시작하기'
    : goTelegramAfterSignup
      ? '다음 단계 →'
      : 'MarketLens 시작하기'

  if (phase === 'telegram') {
    return (
      <div className={styles.page}>
        <OnboardingFloatField occluderRef={cardRef} />
        <div className={`${styles.shell} ${styles.shellNarrow}`}>
          <div ref={cardRef} className={styles.card}>
            <div className={styles.cardNav}>
              <OnboardingBackButton
                label="알림 설정"
                onClick={goToAlertsFromTelegram}
                disabled={isSubmitting}
              />
            </div>
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
              <button
                type="button"
                className={styles.skipBtn}
                disabled={isSubmitting}
                onClick={() => void finishOnboardingFromTelegramStep()}
              >
                나중에 하기
              </button>
              <button
                type="button"
                className={styles.submit}
                disabled={isSubmitting}
                onClick={() => void finishOnboardingFromTelegramStep()}
              >
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
            {!registrationDone ? (
              <div className={styles.cardNav}>
                <OnboardingBackButton label="관심 종목" onClick={goToWatchlist} disabled={isSubmitting} />
              </div>
            ) : null}
            <StepIndicator
              phase="alerts"
              upcomingTelegramStep={goTelegramAfterSignup}
            />
            <SignupAlertsStep settings={alertSettings} onSettingsChange={setAlertSettings} />
            {submitError ? (
              <p className={styles.error} role="alert">
                {submitError}
              </p>
            ) : null}
            {goTelegramAfterSignup && !registrationDone ? (
              <p className={styles.hint}>
                다음 단계에서 가입을 마친 뒤 텔레그램 연동을 진행합니다.
              </p>
            ) : null}
            <button
              type="button"
              className={`${styles.submit} ${styles.submitWide}`}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={() => void finishRegistration()}
            >
              {isSubmitting ? <ButtonSpinner /> : alertsSubmitLabel}
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
