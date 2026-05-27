import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { SignupAccountDraft } from '../components/auth/AuthPanel'
import { Layout } from '../components/common/Layout'
import { DEFAULT_ALERT_SETTINGS, SignupAlertsStep } from '../components/auth/SignupAlertsStep'
import { SignupWatchlistStep } from '../components/auth/SignupWatchlistStep'
import { ButtonSpinner } from '../components/ui/ButtonSpinner'
import { PillButton } from '../components/ui/PillButton'
import type { AlertSettings } from '../data/types/member'
import { useAuthFlow } from '../hooks/useAuthFlow'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore } from '../store/authStore'
import type { WatchlistItem } from '../store/watchlistStore'
import styles from './OnboardingPage.module.css'

type OnboardingPhase = 'watchlist' | 'alerts'

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

export default function OnboardingPage() {
  const location = useLocation()
  const openAuthModal = useAuthModalStore((s) => s.open)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const role = useAuthStore((state) => state.role)
  const { handleCompleteRegistration } = useAuthFlow()

  const accountDraft = readAccountDraft(location.state)
  const [phase, setPhase] = useState<OnboardingPhase>('watchlist')
  const [watchlistSelection, setWatchlistSelection] = useState<WatchlistItem[]>([])
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS)
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoggedIn) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  if (!accountDraft) {
    return (
      <Layout>
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
      </Layout>
    )
  }

  const finishRegistration = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await handleCompleteRegistration({
        pendingSignupToken: accountDraft.pendingSignupToken,
        watchlist: watchlistSelection,
        alertSettings,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (phase === 'alerts') {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={`${styles.shell} ${styles.shellNarrow}`}>
            <div className={styles.card}>
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
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.card}>
            <SignupWatchlistStep
              selected={watchlistSelection}
              onSelectedChange={setWatchlistSelection}
              error={stepError}
              onError={setStepError}
            />
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.submit}
                onClick={() => {
                  setStepError(null)
                  setPhase('alerts')
                }}
              >
                {watchlistSelection.length === 0 ? '건너뛰기' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
