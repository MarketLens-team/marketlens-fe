import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { MyPagePasswordChangeModal } from './MyPagePasswordChangeModal'
import { MyPagePasswordVerifyModal } from './MyPagePasswordVerifyModal'
import styles from './MyPagePasswordChange.module.css'

interface MyPagePasswordChangeProps {
  email: string
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function MyPagePasswordChange({ email, onSuccess, onError }: MyPagePasswordChangeProps) {
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  return (
    <section className={styles.root} aria-labelledby="password-change-title">
      <h2 id="password-change-title" className={styles.pageTitle}>
        비밀번호 변경
      </h2>

      <div className={styles.content}>
        <p className={styles.lead}>
          보안을 위해 등록된 이메일로 인증한 뒤 비밀번호를 변경할 수 있습니다.
        </p>
        <ActionButton type="button" className={styles.action} onClick={() => setVerifyOpen(true)}>
          비밀번호 변경
        </ActionButton>
      </div>

      <MyPagePasswordVerifyModal
        isOpen={verifyOpen}
        email={email}
        onClose={() => setVerifyOpen(false)}
        onVerified={() => {
          setVerifyOpen(false)
          setPasswordOpen(true)
        }}
      />

      <MyPagePasswordChangeModal
        isOpen={passwordOpen}
        email={email}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => {
          setPasswordOpen(false)
          onSuccess?.()
        }}
        onError={onError}
      />
    </section>
  )
}
