import { useState } from 'react'
import { ActionButton } from '../components/ui/ActionButton'
import styles from './DevActionButtonPage.module.css'

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function DevActionButtonPage() {
  const [clickCount, setClickCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

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
            <ActionButton variant="danger">Delete</ActionButton>
          </div>
        </div>
      </section>
    </main>
  )
}
