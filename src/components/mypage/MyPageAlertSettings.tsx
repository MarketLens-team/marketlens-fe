import type { AlertSettings } from '../../data/types/member'
import styles from './MyPageAlertSettings.module.css'

const ALERT_OPTIONS: { key: keyof AlertSettings; label: string; description: string }[] = [
  {
    key: 'buzzSurgeEnabled',
    label: '언급량 급등',
    description: '관심 종목의 언급량이 기준치(+200%) 이상 급증하면 알려드립니다.',
  },
  {
    key: 'sentimentChangeEnabled',
    label: '감성 점수 급변',
    description: '감성 점수가 ±30점 이상 변동하면 알려드립니다.',
  },
  {
    key: 'personMentionEnabled',
    label: '관심 인물 발언',
    description: '등록한 핵심 인물의 발언이 감지되면 알려드립니다.',
  },
  {
    key: 'dailySummaryEnabled',
    label: '일간 요약',
    description: '매일 오전 8시, 관심 종목·뉴스 요약을 보내드립니다.',
  },
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
    <section className={styles.root} aria-labelledby="alert-settings-title">
      <h2 id="alert-settings-title" className={styles.pageTitle}>
        알림 설정
      </h2>

      <div className={styles.section}>
        <ul className={styles.optionList}>
          {ALERT_OPTIONS.map((option) => {
            const checked = settings[option.key]
            return (
              <li key={option.key} className={styles.option}>
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
              </li>
            )
          })}
        </ul>
      </div>

      <div className={styles.exampleSection}>
        <h3 className={styles.sectionTitle}>알림 예시</h3>
        <p className={styles.exampleText}>{alertExample}</p>
      </div>
    </section>
  )
}
