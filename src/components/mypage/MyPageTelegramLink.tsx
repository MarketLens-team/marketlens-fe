import { useTelegramLink } from '../../hooks/useTelegramLink'
import { resolveTelegramBotUsername } from '../../constants/telegram'
import { ActionButton } from '../ui/ActionButton'
import { TelegramIcon } from '../ui/TelegramIcon'
import styles from './MyPageTelegramLink.module.css'

interface MyPageTelegramLinkProps {
  onOpened?: () => void
  onError?: (message: string) => void
}

export function MyPageTelegramLink({ onOpened, onError }: MyPageTelegramLinkProps) {
  const { linking, linkTelegram } = useTelegramLink({ onOpened, onError })
  const botUsername = resolveTelegramBotUsername()

  return (
    <section className={styles.root} aria-labelledby="telegram-link-title">
      <h2 id="telegram-link-title" className={styles.pageTitle}>
        텔레그램 연동
      </h2>

      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.lead}>
            텔레그램 봇 <span className={styles.botName}>@{botUsername}</span>과 연동하면 알림을
            메신저로 받을 수 있습니다.
          </p>
          <p className={styles.note}>
            연동 버튼을 누른 뒤 텔레그램에서 시작을 선택해 주세요. 인증 코드는 5분 동안 유효합니다.
          </p>
        </div>

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
    </section>
  )
}
