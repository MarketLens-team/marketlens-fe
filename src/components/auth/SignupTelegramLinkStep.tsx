import { useTelegramLink } from '../../hooks/useTelegramLink'
import { resolveTelegramBotUsername } from '../../constants/telegram'
import { ActionButton } from '../ui/ActionButton'
import { TelegramIcon } from '../ui/TelegramIcon'
import styles from './SignupTelegramLinkStep.module.css'

interface SignupTelegramLinkStepProps {
  onLinkOpened?: () => void
  onLinkError?: (message: string) => void
}

export function SignupTelegramLinkStep({ onLinkOpened, onLinkError }: SignupTelegramLinkStepProps) {
  const { linking, linkTelegram, linkUrls } = useTelegramLink({ onOpened: onLinkOpened, onError: onLinkError })
  const botUsername = resolveTelegramBotUsername()

  return (
    <div className={styles.root}>
      <p className={styles.lead}>
        텔레그램 봇 <span className={styles.botName}>@{botUsername}</span>과 연동하면 알림을 메신저로
        받을 수 있습니다.
      </p>
      <p className={styles.note}>
        연동 버튼을 누르면 Telegram Web이 열립니다. <strong>QR로 로그인</strong>하면 봇 채팅으로
        이동하니 <strong>시작(Start)</strong>을 눌러 연동을 완료해 주세요.
      </p>
      {linkUrls ? (
        <p className={styles.noteMuted}>
          빈 화면이면{' '}
          <a className={styles.fallbackLink} href={linkUrls.webLogin} target="_blank" rel="noopener noreferrer">
            QR 로그인만
          </a>
          {' → 로그인 후 '}
          <a className={styles.fallbackLink} href={linkUrls.webBot} target="_blank" rel="noopener noreferrer">
            봇 열기
          </a>
          {' · '}
          <a className={styles.fallbackLink} href={linkUrls.tme} target="_blank" rel="noopener noreferrer">
            t.me (앱)
          </a>
        </p>
      ) : null}
      <ActionButton
        type="button"
        variant="primary"
        className={styles.action}
        loading={linking}
        onClick={() => void linkTelegram()}
      >
        <TelegramIcon className={styles.telegramIcon} />
        텔레그램 연동
      </ActionButton>
    </div>
  )
}
