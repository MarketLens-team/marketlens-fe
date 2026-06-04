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
  const { linking, linkTelegram, linkUrls } = useTelegramLink({ onOpened, onError })
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
            연동 버튼을 누르면 텔레그램 앱 또는 t.me 연동 페이지가 열립니다. 봇 채팅에서{' '}
            <strong>시작(Start)</strong>을 눌러 연동을 완료해 주세요. 인증 코드는 5분 동안
            유효합니다.
          </p>
          {linkUrls ? (
            <p className={styles.noteMuted}>
              앱이 열리지 않으면{' '}
              <a
                className={styles.webFallbackLink}
                href={linkUrls.tme}
                target="_blank"
                rel="noopener noreferrer"
              >
                t.me에서 연동
              </a>
              {' · '}
              <a
                className={styles.webFallbackLink}
                href={linkUrls.webClient}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram Web에서 연동
              </a>
            </p>
          ) : (
            <p className={styles.noteMuted}>
              Mac·Windows에 텔레그램 앱이 설치되어 있어야 합니다. 앱이 없으면 연동 후 아래 링크가
              표시됩니다.
            </p>
          )}
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
