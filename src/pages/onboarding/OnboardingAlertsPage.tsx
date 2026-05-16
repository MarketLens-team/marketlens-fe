import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from '../../components/onboarding/OnboardingShell'
import { fetchAlertSettings, updateAlertSettings } from '../../data/clients/memberClient'
import type { AlertSettings } from '../../data/types/member'
import styles from './OnboardingAlertsPage.module.css'

const ALERT_OPTIONS: { key: keyof AlertSettings; label: string; description: string }[] = [
  { key: 'buzzSurgeEnabled', label: '언급량 급등', description: '24시간 언급량이 평소 대비 크게 늘었을 때' },
  {
    key: 'sentimentChangeEnabled',
    label: '감성 급락',
    description: '관심 종목 감성 점수가 급격히 하락했을 때',
  },
  { key: 'personMentionEnabled', label: '인물 발언', description: '핵심 인물의 새로운 발언이 등록됐을 때' },
  { key: 'dailySummaryEnabled', label: '일간 요약', description: '하루 시장·종목 요약 리포트' },
]

export default function OnboardingAlertsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AlertSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchAlertSettings()
        if (!cancelled) setSettings(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '알림 설정을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (key: keyof AlertSettings) => {
    setSettings((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev))
  }

  const finish = async (save: boolean) => {
    setSubmitting(true)
    setError(null)
    try {
      if (save && settings) {
        await updateAlertSettings(settings)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 설정 저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OnboardingShell
      step={3}
      title="알림을 설정해 주세요"
      description="필요한 알림만 켜 두세요. 마이페이지에서 언제든 바꿀 수 있습니다."
      footer={
        <>
          <button type="button" className={styles.btnGhost} onClick={() => finish(false)} disabled={submitting}>
            건너뛰기
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => finish(true)}
            disabled={submitting || loading || !settings}
          >
            {submitting ? '저장 중…' : 'MarketLens 시작하기'}
          </button>
        </>
      }
    >
      {error ? (
        <p className={styles.bannerError} role="alert">
          {error}
        </p>
      ) : null}

      {loading || !settings ? (
        <p className={styles.loading}>알림 설정을 불러오는 중…</p>
      ) : (
        <ul className={styles.optionList}>
          {ALERT_OPTIONS.map((option) => (
            <li key={option.key}>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={settings[option.key]}
                  onChange={() => toggle(option.key)}
                />
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDesc}>{option.description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </OnboardingShell>
  )
}
