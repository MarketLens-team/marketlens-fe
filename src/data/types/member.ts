/** PUT /api/members/me/settings 요청·저장 가능 필드 */
export interface AlertSettings {
  buzzSurgeEnabled: boolean
  sentimentChangeEnabled: boolean
  personMentionEnabled: boolean
  dailySummaryEnabled: boolean
  emailNotificationEnabled: boolean
  telegramNotificationEnabled: boolean
}

/** GET/PUT 응답 — `telegramLinked`는 읽기 전용(연동 여부) */
export interface AlertSettingsResponse extends AlertSettings {
  telegramLinked: boolean
}

export function toAlertSettings(settings: AlertSettingsResponse): AlertSettings {
  const {
    buzzSurgeEnabled,
    sentimentChangeEnabled,
    personMentionEnabled,
    dailySummaryEnabled,
    emailNotificationEnabled,
    telegramNotificationEnabled,
  } = settings
  return {
    buzzSurgeEnabled,
    sentimentChangeEnabled,
    personMentionEnabled,
    dailySummaryEnabled,
    emailNotificationEnabled,
    telegramNotificationEnabled,
  }
}

/** 미연동인데 텔레그램 알림이 켜져 있으면 서버에 끄도록 동기화가 필요함 */
export function needsTelegramNotificationSync(settings: AlertSettingsResponse): boolean {
  return !settings.telegramLinked && settings.telegramNotificationEnabled
}
