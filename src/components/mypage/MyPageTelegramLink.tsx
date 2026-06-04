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
  const { linking, linkTelegram, webLinkUrl } = useTelegramLink({ onOpened, onError })
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
            연동 버튼을 누르면 <strong>Telegram Web</strong>이 새 탭에서 열립니다. 전화번호로
            로그인한 뒤 봇 채팅에서 <strong>시작(Start)</strong>을 눌러 연동을 완료해 주세요.
            인증 코드는 5분 동안 유효합니다.
          </p>
          <p className={styles.noteMuted}>
            Mac 앱이 설치되어 있으면 앱으로 열릴 수도 있습니다. 탭이 닫혔다면 아래 링크로 다시
            열어 주세요.
          </p>
          {webLinkUrl ? (
            <p className={styles.noteMuted}>
              <a
                className={styles.webFallbackLink}
                href={webLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                텔레그램 연동 페이지 다시 열기
              </a>
            </p>
          ) : null}
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
