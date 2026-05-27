import type { MyPageAccount } from '../../data/types/myPage'
import styles from './MyPageAccountInfo.module.css'

interface MyPageAccountInfoProps {
  account: MyPageAccount
}

function formatJoinedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const FIELDS: { key: keyof MyPageAccount; label: string; format?: (v: string) => string }[] = [
  { key: 'nickname', label: '닉네임' },
  { key: 'email', label: '이메일' },
  { key: 'joinedAt', label: '가입일', format: formatJoinedAt },
  { key: 'plan', label: '플랜' },
]

export function MyPageAccountInfo({ account }: MyPageAccountInfoProps) {
  return (
    <section className={styles.root} aria-labelledby="account-info-title">
      <h2 id="account-info-title" className={styles.pageTitle}>
        계정 정보
      </h2>
      <dl className={styles.list}>
        {FIELDS.map(({ key, label, format }) => {
          const raw = account[key]
          const value = format ? format(String(raw)) : String(raw)
          return (
            <div key={key} className={styles.row}>
              <dt className={styles.label}>{label}</dt>
              <dd className={key === 'plan' ? styles.valuePlan : styles.value}>{value}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
