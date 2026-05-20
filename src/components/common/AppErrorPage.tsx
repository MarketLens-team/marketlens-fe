import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import type { ErrorPagePreset } from '../../data/errorPagePresets'
import styles from './AppErrorPage.module.css'

export type AppErrorPageLayout = 'fullscreen' | 'embedded'

export interface AppErrorPageProps {
  preset: ErrorPagePreset
  /** fullscreen: 단독 라우트용(별도 main). embedded: Layout의 main 안 카드 블록 */
  layout?: AppErrorPageLayout
  showDevBackLink?: boolean
  homeHref?: string
}

function statusDisplay(preset: ErrorPagePreset): string {
  if (preset.statusCode != null) return String(preset.statusCode)
  if (preset.variant === 'network') return 'NET'
  return 'ERR'
}

function AuthLockIcon() {
  return (
    <svg className={styles.authIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" />
    </svg>
  )
}

export function AppErrorPage({
  preset,
  layout = 'fullscreen',
  showDevBackLink = false,
  homeHref = '/',
}: AppErrorPageProps) {
  const navigate = useNavigate()
  const status = statusDisplay(preset)
  const headline =
    layout === 'embedded' ? preset.title : `${status} | ${preset.title}`
  const showAuthIcon = preset.tone === 'auth'
  const primaryIsLogin = preset.primaryCta === 'login'
  const loginHref = preset.loginHref ?? '/login'

  const isFullscreen = layout === 'fullscreen'
  const Root: 'main' | 'div' = isFullscreen ? 'main' : 'div'

  return (
    <Root
      className={clsx(
        styles.page,
        isFullscreen ? styles.pageFullscreen : styles.pageEmbedded,
      )}
      data-tone={preset.tone}
      data-variant={preset.variant}
    >
      {isFullscreen ? (
        <>
          <div className={styles.stars} aria-hidden />
          <p className={styles.bgCode} aria-hidden>
            {status}
          </p>
        </>
      ) : null}

      <section className={styles.content} role="alert">
        {showAuthIcon ? (
          <div className={styles.iconWrap} aria-hidden>
            <AuthLockIcon />
          </div>
        ) : null}

        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.message}>{preset.message}</p>
        {preset.hint ? <p className={styles.hint}>{preset.hint}</p> : null}

        <div className={styles.actions}>
          {primaryIsLogin ? (
            <>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate(loginHref)}
              >
                로그인하기
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate(homeHref)}
              >
                홈으로 돌아가기
              </button>
            </>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={() => navigate(homeHref)}>
              홈으로 돌아가기
            </button>
          )}
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
            이전 페이지
          </button>
        </div>

        {preset.errorCode ? (
          <p className={styles.errorCode}>{preset.errorCode}</p>
        ) : null}
      </section>

      {showDevBackLink && isFullscreen ? (
        <Link className={styles.devLink} to="/dev/errors">
          에러 페이지 갤러리
        </Link>
      ) : null}
    </Root>
  )
}
