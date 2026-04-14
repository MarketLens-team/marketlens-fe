import { useState } from 'react'
import { ActionButton } from '../components/ui/ActionButton'
import { AlertModal } from '../components/ui/AlertModal'
import styles from './DevActionButtonPage.module.css'

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function DevActionButtonPage() {
  const [clickCount, setClickCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)

  const handleLoadingClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    setClickCount((prev) => prev + 1)
    try {
      await sleep(1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await sleep(1200)
      setDeleteCount((prev) => prev + 1)
      setIsDeleteAlertOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Action Button Dev Page</h1>
        <p className={styles.desc}>Button states and interaction rules test.</p>

        <div className={styles.grid}>
          <div className={styles.item}>
            <h2 className={styles.label}>Default / Confirm</h2>
            <ActionButton variant="confirm">Confirm Action</ActionButton>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>Loading (duplicate click blocked)</h2>
            <ActionButton variant="confirm" loading={isLoading} onClick={handleLoadingClick}>
              Submit
            </ActionButton>
            <p className={styles.meta}>Accepted clicks: {clickCount}</p>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>Disabled</h2>
            <ActionButton variant="confirm" disabled>
              Disabled Action
            </ActionButton>
          </div>

          <div className={styles.item}>
            <h2 className={styles.label}>Danger</h2>
            <ActionButton variant="danger" onClick={() => setIsDeleteAlertOpen(true)}>
              Delete
            </ActionButton>
            <p className={styles.meta}>Completed deletes: {deleteCount}</p>
          </div>
        </div>
      </section>

      <AlertModal
        isOpen={isDeleteAlertOpen}
        title="정말 삭제하시겠습니까?"
        message="삭제 후에는 복구할 수 없습니다. 계속 진행하시겠어요?"
        onClose={() => {
          if (isDeleting) return
          setIsDeleteAlertOpen(false)
        }}
        onConfirm={handleDeleteConfirm}
        confirmLabel="삭제"
        cancelLabel="취소"
        confirmLoading={isDeleting}
        tone="danger"
      />
    </main>
  )
}
