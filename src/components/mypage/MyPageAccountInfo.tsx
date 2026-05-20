import type { MyPageAccount } from '../../data/types/myPage'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
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

export function MyPageAccountInfo({ account }: MyPageAccountInfoProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="계정 정보" variant="embedded" />
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt>닉네임</dt>
          <dd>{account.nickname}</dd>
        </div>
        <div className={styles.row}>
          <dt>이메일</dt>
          <dd>{account.email}</dd>
        </div>
        <div className={styles.row}>
          <dt>가입일</dt>
          <dd>{formatJoinedAt(account.joinedAt)}</dd>
        </div>
        <div className={styles.row}>
          <dt>플랜</dt>
          <dd className={styles.plan}>{account.plan}</dd>
        </div>
      </dl>
    </Card>
  )
}
