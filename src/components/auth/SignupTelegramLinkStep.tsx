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
        연동 버튼을 누르면 브라우저에서 Telegram 앱 열기를 확인합니다. 앱이 열리면 봇 채팅에서{' '}
        <strong>시작(Start)</strong>을 눌러 연동을 완료해 주세요.
      </p>
      {linkUrls ? (
        <p className={styles.noteMuted}>
          앱이 열리지 않으면{' '}
          <a className={styles.fallbackLink} href={linkUrls.tme} target="_blank" rel="noopener noreferrer">
            t.me에서 연동
          </a>
          {' · '}
          <a
            className={styles.fallbackLink}
            href={linkUrls.webClient}
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram Web에서 연동
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
