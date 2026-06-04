import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { MyPagePasswordChangeModal } from './MyPagePasswordChangeModal'
import styles from './MyPagePasswordChange.module.css'

interface MyPagePasswordChangeProps {
  email: string
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function MyPagePasswordChange({ email, onSuccess, onError }: MyPagePasswordChangeProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className={styles.root} aria-labelledby="password-change-title">
      <h2 id="password-change-title" className={styles.pageTitle}>
        비밀번호 변경
      </h2>

      <div className={styles.content}>
        <p className={styles.lead}>
          보안을 위해 등록된 이메일로 인증한 뒤 비밀번호를 변경할 수 있습니다.
        </p>
        <ActionButton
          type="button"
          className={styles.action}
          onClick={() => setModalOpen(true)}
        >
          비밀번호 변경
        </ActionButton>
      </div>

      <MyPagePasswordChangeModal
        isOpen={modalOpen}
        email={email}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          onSuccess?.()
        }}
        onError={onError}
      />
    </section>
  )
}
