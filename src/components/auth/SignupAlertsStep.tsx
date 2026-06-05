import { resolveTelegramBotUsername } from '../../constants/telegram'
import type { AlertSettings } from '../../data/types/member'
import styles from './SignupAlertsStep.module.css'

type AlertSettingKey = keyof AlertSettings

interface SettingOption {
  key: AlertSettingKey
  label: string
  description: string
}

const CHANNEL_OPTIONS: SettingOption[] = [
  {
    key: 'emailNotificationEnabled',
    label: '이메일 알림',
    description: '가입 이메일로 알림을 받습니다.',
  },
  {
    key: 'telegramNotificationEnabled',
    label: '텔레그램 알림',
    description: `텔레그램 ON이면 가입 후 3단계에서 @${resolveTelegramBotUsername()} 연동합니다.`,
  },
]

const ALERT_OPTIONS: SettingOption[] = [
  {
    key: 'buzzSurgeEnabled',
    label: '언급량 급등',
    description: '24시간 언급량이 평소 대비 크게 늘었을 때',
  },
  {
    key: 'sentimentChangeEnabled',
    label: '감성 급락',
    description: '관심 종목 감성 점수가 급격히 하락했을 때',
  },
  {
    key: 'dailySummaryEnabled',
    label: '일간 요약',
    description: '매일 오전 9시 시장·종목 요약 리포트',
  },
]

interface SignupAlertsStepProps {
  settings: AlertSettings
  onSettingsChange: (settings: AlertSettings) => void
}

interface AlertOptionRowProps {
  option: SettingOption
  checked: boolean
  onToggle: (key: AlertSettingKey) => void
}

function AlertOptionRow({ option, checked, onToggle }: AlertOptionRowProps) {
  return (
    <li>
      <label className={styles.option}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={checked}
          onChange={() => onToggle(option.key)}
        />
        <span className={styles.checkboxBox} aria-hidden />
        <span className={styles.optionText}>
          <span className={styles.optionLabel}>{option.label}</span>
          <span className={styles.optionDesc}>{option.description}</span>
        </span>
      </label>
    </li>
  )
}

export function SignupAlertsStep({ settings, onSettingsChange }: SignupAlertsStepProps) {
  const toggle = (key: AlertSettingKey) => {
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  return (
    <div className={styles.root}>
      <section className={styles.section} aria-labelledby="signup-alert-channels">
        <h3 id="signup-alert-channels" className={styles.sectionTitle}>
          수신 채널
        </h3>
        <ul className={styles.optionList}>
          {CHANNEL_OPTIONS.map((option) => (
            <AlertOptionRow
              key={option.key}
              option={option}
              checked={settings[option.key]}
              onToggle={toggle}
            />
          ))}
        </ul>
      </section>

      <hr className={styles.sectionDivider} aria-hidden />

      <section className={styles.section} aria-labelledby="signup-alert-types">
        <h3 id="signup-alert-types" className={styles.sectionTitle}>
          알림 종류
        </h3>
        <ul className={styles.optionList}>
          {ALERT_OPTIONS.map((option) => (
            <AlertOptionRow
              key={option.key}
              option={option}
              checked={settings[option.key]}
              onToggle={toggle}
            />
          ))}
        </ul>
      </section>
    </div>
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
