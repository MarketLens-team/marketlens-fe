import type { AlertSettings } from '../../data/types/member'
import styles from './SignupAlertsStep.module.css'

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

interface SignupAlertsStepProps {
  settings: AlertSettings
  onSettingsChange: (settings: AlertSettings) => void
}

export function SignupAlertsStep({ settings, onSettingsChange }: SignupAlertsStepProps) {
  const toggle = (key: keyof AlertSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  return (
    <ul className={styles.optionList}>
      {ALERT_OPTIONS.map((option) => (
        <li key={option.key}>
          <label className={styles.option}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={settings[option.key]}
              onChange={() => toggle(option.key)}
            />
            <span className={styles.checkboxBox} aria-hidden />
            <span className={styles.optionText}>
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionDesc}>{option.description}</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  buzzSurgeEnabled: true,
  sentimentChangeEnabled: true,
  personMentionEnabled: true,
  dailySummaryEnabled: true,
  emailNotificationEnabled: true,
  telegramNotificationEnabled: true,
}
