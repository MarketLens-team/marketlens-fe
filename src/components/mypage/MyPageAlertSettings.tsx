import type { AlertSettings } from '../../data/types/member'
import styles from './MyPageAlertSettings.module.css'

type AlertSettingKey = keyof AlertSettings

interface SettingOption {
  key: AlertSettingKey
  label: string
  description: string
}

const CHANNEL_OPTIONS: SettingOption[] = [
  {
    key: 'emailNotificationEnabled',
    label: '이메일',
    description: '가입 이메일로 알림을 받습니다.',
  },
  {
    key: 'telegramNotificationEnabled',
    label: '텔레그램',
    description: '연동한 텔레그램 계정으로 알림을 받습니다. 위에서 텔레그램 연동이 필요합니다.',
  },
]

const ALERT_OPTIONS: SettingOption[] = [
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
  saving?: boolean
  onSettingsChange: (settings: AlertSettings) => void
}

interface AlertSettingToggleProps {
  option: SettingOption
  checked: boolean
  saving: boolean
  onToggle: (key: AlertSettingKey) => void
}

function AlertSettingToggle({ option, checked, saving, onToggle }: AlertSettingToggleProps) {
  return (
    <li className={styles.option}>
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
        onClick={() => onToggle(option.key)}
      >
        <span className={styles.toggleTrack} data-on={checked ? 'true' : 'false'}>
          <span className={styles.toggleThumb} />
        </span>
      </button>
    </li>
  )
}

export function MyPageAlertSettings({
  settings,
  saving = false,
  onSettingsChange,
}: MyPageAlertSettingsProps) {
  const toggle = (key: AlertSettingKey) => {
    if (saving) return
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  return (
    <section className={styles.root} aria-labelledby="alert-settings-title">
      <h2 id="alert-settings-title" className={styles.pageTitle}>
        알림 설정
      </h2>

      <div className={styles.subsection}>
        <h3 className={styles.sectionTitle}>수신 채널</h3>
        <ul className={styles.optionList}>
          {CHANNEL_OPTIONS.map((option) => (
            <AlertSettingToggle
              key={option.key}
              option={option}
              checked={settings[option.key]}
              saving={saving}
              onToggle={toggle}
            />
          ))}
        </ul>
      </div>

      <hr className={styles.subsectionDivider} aria-hidden />

      <div className={styles.subsection}>
        <h3 className={styles.sectionTitle}>알림 종류</h3>
        <ul className={styles.optionList}>
          {ALERT_OPTIONS.map((option) => (
            <AlertSettingToggle
              key={option.key}
              option={option}
              checked={settings[option.key]}
              saving={saving}
              onToggle={toggle}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
