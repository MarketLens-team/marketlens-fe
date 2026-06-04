import type { EmailVerificationPurpose } from '../../data/types/auth'
import { Modal } from '../ui/Modal'
import { AuthEmailVerifyStep } from './AuthEmailVerifyStep'
import styles from './AuthEmailVerifyModal.module.css'

export interface AuthEmailVerifyModalProps {
  isOpen: boolean
  email: string
  purpose?: EmailVerificationPurpose
  onClose: () => void
  onVerified: () => void | Promise<void>
}

export function AuthEmailVerifyModal({
  isOpen,
  email,
  purpose = 'SIGNUP',
  onClose,
  onVerified,
}: AuthEmailVerifyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      closeButtonLabel="이메일 인증 닫기"
      lockBackgroundScroll
      closeOnEsc
      closeOnOverlay
      contentClassOnly
      contentClassName={styles.dialog}
      bodyClassName={styles.body}
      overlayClassName={styles.overlay}
    >
      <AuthEmailVerifyStep
        email={email}
        purpose={purpose}
        showTopBar={false}
        initialCodeExpanded
        onBack={onClose}
        onVerified={onVerified}
      />
    </Modal>
  )
}
