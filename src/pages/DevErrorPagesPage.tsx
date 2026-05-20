import { Link } from 'react-router-dom'
import {
  ERROR_PAGE_PRESETS,
  ERROR_PAGE_VARIANTS,
  type ErrorPageVariant,
} from '../data/errorPagePresets'
import styles from './DevErrorPagesPage.module.css'

function variantLabel(variant: ErrorPageVariant): string {
  const preset = ERROR_PAGE_PRESETS[variant]
  if (preset.statusCode != null) {
    return `${preset.statusCode} · ${preset.title}`
  }
  return preset.title
}

export default function DevErrorPagesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Dev</p>
        <h1 className={styles.title}>에러 페이지 시안</h1>
        <p className={styles.desc}>
          백엔드 ErrorCode 메시지와 맞춘 공통 <code className={styles.inlineCode}>AppErrorPage</code>{' '}
          프리뷰입니다. 항목을 눌러 전체 화면을 확인하세요.
        </p>

        <ul className={styles.list}>
          {ERROR_PAGE_VARIANTS.map((variant) => {
            const preset = ERROR_PAGE_PRESETS[variant]
            return (
              <li key={variant}>
                <Link
                  className={styles.card}
                  data-tone={preset.tone}
                  to={`/dev/errors/${variant}`}
                >
                  <span className={styles.cardCode}>
                    {preset.statusCode ?? '—'}
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardTitle}>{variantLabel(variant)}</span>
                    <span className={styles.cardMessage}>{preset.message}</span>
                    {preset.errorCode ? (
                      <span className={styles.cardMeta}>{preset.errorCode}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className={styles.footer}>
          <Link className={styles.backLink} to="/dev">
            ← Dev 홈 (Action Button)
          </Link>
        </div>
      </section>
    </main>
  )
}
