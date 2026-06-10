import { useState } from 'react'
import { useTelegramLink } from '../../hooks/useTelegramLink'
import { resolveTelegramBotUsername } from '../../constants/telegram'
import type { AlertSettingsResponse } from '../../data/types/member'
import { ActionButton } from '../ui/ActionButton'
import { AlertModal } from '../ui/AlertModal'
import { TelegramIcon } from '../ui/TelegramIcon'
import styles from './MyPageTelegramLink.module.css'

interface MyPageTelegramLinkProps {
  linked: boolean
  onOpened?: () => void
  onError?: (message: string) => void
  onUnlinked?: (settings: AlertSettingsResponse) => void
}

export function MyPageTelegramLink({ linked, onOpened, onError, onUnlinked }: MyPageTelegramLinkProps) {
  const { linking, unlinking, linkTelegram, unlinkTelegram, linkUrls } = useTelegramLink({
    onOpened,
    onError,
  })
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false)
  const botUsername = resolveTelegramBotUsername()

  const handleUnlinkConfirm = async () => {
    const updated = await unlinkTelegram()
    if (!updated) return

    setUnlinkModalOpen(false)
    onUnlinked?.(updated)
  }

  return (
    <section className={styles.root} aria-labelledby="telegram-link-title">
      <h2 id="telegram-link-title" className={styles.pageTitle}>
        텔레그램 연동
      </h2>

      <div className={styles.content}>
        <div className={styles.text}>
          {linked ? (
            <p className={styles.lead}>텔레그램 봇과 연동되어 있습니다.</p>
          ) : (
            <>
              <p className={styles.lead}>
                텔레그램 봇 <span className={styles.botName}>@{botUsername}</span>과 연동하면 알림을
                메신저로 받을 수 있습니다.
              </p>
              <p className={styles.note}>
                연동 버튼을 누르면 Telegram Web이 열립니다. <strong>QR로 로그인</strong>하면 봇
                채팅으로 이동하니 <strong>시작(Start)</strong>을 눌러 연동을 완료해 주세요. 인증
                코드는 5분 동안 유효합니다.
              </p>
              {linkUrls ? (
                <p className={styles.noteMuted}>
                  빈 화면이면{' '}
                  <a
                    className={styles.webFallbackLink}
                    href={linkUrls.webLogin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    QR 로그인만
                  </a>
                  {' → 로그인 후 '}
                  <a
                    className={styles.webFallbackLink}
                    href={linkUrls.webBot}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    봇 열기
                  </a>
                  {' · '}
                  <a
                    className={styles.webFallbackLink}
                    href={linkUrls.tme}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    t.me (앱)
                  </a>
                </p>
              ) : null}
            </>
          )}
        </div>

        {linked ? (
          <ActionButton
            type="button"
            variant="danger"
            className={styles.action}
            loading={unlinking}
            onClick={() => setUnlinkModalOpen(true)}
          >
            연동 해제
          </ActionButton>
        ) : (
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
        )}
      </div>

      <AlertModal
        isOpen={unlinkModalOpen}
        title="텔레그램 연동을 해제하시겠습니까?"
        message="연동을 해제하면 텔레그램 알림 수신이 중단됩니다. 다시 받으려면 연동을 진행해 주세요."
        onClose={() => {
          if (unlinking) return
          setUnlinkModalOpen(false)
        }}
        onConfirm={() => void handleUnlinkConfirm()}
        confirmLabel="연동 해제"
        cancelLabel="취소"
        confirmLoading={unlinking}
        tone="danger"
      />
    </section>
  )
}
