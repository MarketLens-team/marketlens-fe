import clsx from 'clsx'
import { EmptyState } from '../common/EmptyState'
import { PillButton } from '../ui/PillButton'
import { useAuthModalStore } from '../../store/authModalStore'
import styles from './DashboardLoginPrompt.module.css'

interface DashboardLoginPromptProps {
  title: string
  message: string
  compact?: boolean
  className?: string
}

export function DashboardLoginPrompt({ title, message, compact = false, className }: DashboardLoginPromptProps) {
  const openAuthModal = useAuthModalStore((s) => s.open)

  return (
    <EmptyState
      className={clsx(styles.root, compact && styles.compact, className)}
      title={title}
      message={message}
      actions={
        <PillButton variant="primary" type="button" onClick={() => openAuthModal('login')}>
          로그인
        </PillButton>
      }
    />
  )
}
