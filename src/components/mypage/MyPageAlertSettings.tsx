import type { AlertSettings } from '../../data/types/member'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import styles from './MyPageAlertSettings.module.css'

const ALERT_OPTIONS: { key: keyof AlertSettings; label: string; description: string }[] = [
  { key: 'buzzSurgeEnabled', label: '언급량 급등', description: '+200% 이상' },
  { key: 'sentimentChangeEnabled', label: '감성 점수 급락', description: '±30점' },
  { key: 'personMentionEnabled', label: '관심 인물 발언 감지', description: '핵심 인물 발언 등록 시' },
  { key: 'dailySummaryEnabled', label: '일간 요약', description: '매일 08:00' },
]

interface MyPageAlertSettingsProps {
  settings: AlertSettings
  alertExample: string
  saving?: boolean
  onSettingsChange: (settings: AlertSettings) => void
}

export function MyPageAlertSettings({
  settings,
  alertExample,
  saving = false,
  onSettingsChange,
}: MyPageAlertSettingsProps) {
  const toggle = (key: keyof AlertSettings) => {
    if (saving) return
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="알림 설정" variant="embedded" />
      <ul className={styles.optionList}>
        {ALERT_OPTIONS.map((option) => {
          const checked = settings[option.key]
          return (
            <li key={option.key}>
              <div className={styles.option}>
                <div className={styles.optionText}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDesc}>{option.description}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  className={styles.toggle}
                  aria-checked={checked}
                  aria-label={option.label}
                  disabled={saving}
                  onClick={() => toggle(option.key)}
                >
                  <span className={styles.toggleTrack} data-on={checked ? 'true' : 'false'}>
                    <span className={styles.toggleThumb} />
                  </span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <div className={styles.exampleBox}>
        <p className={styles.exampleLabel}>알림 예시</p>
        <p className={styles.exampleText}>{alertExample}</p>
      </div>
    </Card>
  )
}
