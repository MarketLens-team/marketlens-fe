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

export function AppErrorPage({
  preset,
  showDevBackLink = false,
  homeHref = '/',
}: AppErrorPageProps) {
  const navigate = useNavigate()
  const status = statusDisplay(preset)
  const headline = `${status} | ${preset.title}`

  return (
    <main className={styles.page} data-tone={preset.tone}>
      <div className={styles.stars} aria-hidden />
      <p className={styles.bgCode} aria-hidden>
        {status}
      </p>

      <section className={styles.content} role="alert">
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.message}>{preset.message}</p>
        {preset.hint ? <p className={styles.hint}>{preset.hint}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.homeBtn} onClick={() => navigate(homeHref)}>
            홈으로 돌아가기
          </button>
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
