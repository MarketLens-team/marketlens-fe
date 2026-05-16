import type { ReactNode } from 'react'
import styles from './OnboardingShell.module.css'

export type OnboardingStep = 2 | 3

interface OnboardingShellProps {
  step: OnboardingStep
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function OnboardingShell({ step, title, description, children, footer }: OnboardingShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.stepRow}>
            <span className={styles.stepBadge}>STEP {step} / 3</span>
            <p className={styles.stepTrail}>
              <span>계정 생성</span>
              <span aria-hidden> — </span>
              <span className={step === 2 ? styles.stepActive : undefined}>관심 종목</span>
              <span aria-hidden> — </span>
              <span className={step === 3 ? styles.stepActive : undefined}>알림 설정</span>
            </p>
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  )
}
