import { Link, useNavigate } from 'react-router-dom'
import type { ErrorPagePreset } from '../../data/errorPagePresets'
import styles from './AppErrorPage.module.css'

export interface AppErrorPageProps {
  preset: ErrorPagePreset
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
  showDevBackLink = false,
  homeHref = '/',
}: AppErrorPageProps) {
  const navigate = useNavigate()
  const status = statusDisplay(preset)
  const headline = `${status} | ${preset.title}`
  const showAuthIcon = preset.tone === 'auth'
  const primaryIsLogin = preset.primaryCta === 'login'
  const loginHref = preset.loginHref ?? '/login'

  return (
    <main className={styles.page} data-tone={preset.tone} data-variant={preset.variant}>
      <div className={styles.stars} aria-hidden />
      <p className={styles.bgCode} aria-hidden>
        {status}
      </p>

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

      {showDevBackLink ? (
        <Link className={styles.devLink} to="/dev/errors">
          에러 페이지 갤러리
        </Link>
      ) : null}
    </main>
  )
}
