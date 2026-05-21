import { useNavigate } from 'react-router-dom'
import { useAuthFlow } from '../../hooks/useAuthFlow'
import { useAuthModalStore } from '../../store/authModalStore'
import { Modal } from '../ui/Modal'
import AuthPanel, { type SignupAccountDraft } from './AuthPanel'
import modalStyles from './AuthLoginModal.module.css'

export interface AuthLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthLoginModal({ isOpen, onClose }: AuthLoginModalProps) {
  const navigate = useNavigate()
  const { handleLogin } = useAuthFlow()
  const mode = useAuthModalStore((s) => s.mode)
  const setMode = useAuthModalStore((s) => s.setMode)

  const handleSignupAccountNext = (draft: SignupAccountDraft) => {
    onClose()
    navigate('/onboarding', { state: { accountDraft: draft } })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      closeButtonLabel="로그인 창 닫기"
      lockBackgroundScroll
      closeOnEsc
      closeOnOverlay
      contentClassOnly
      contentClassName={modalStyles.dialog}
      bodyClassName={modalStyles.body}
      overlayClassName={modalStyles.overlay}
    >
      <AuthPanel
        scope="account-only"
        presentation="modal"
        mode={mode}
        onModeChange={setMode}
        onLogin={async (email, password) => {
          await handleLogin(email, password)
          onClose()
        }}
        onCompleteRegistration={async () => undefined}
        onSignupAccountNext={handleSignupAccountNext}
      />
    </Modal>
  )
}
