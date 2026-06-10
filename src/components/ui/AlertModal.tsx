import type { ReactNode } from 'react'
import { ActionButton } from './ActionButton'
import { Modal } from './Modal'
import styles from './AlertModal.module.css'

export interface AlertModalProps {
  isOpen: boolean
  title: ReactNode
  message?: ReactNode
  onClose: () => void
  onConfirm: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
  tone?: 'default' | 'danger'
}

export function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmLoading = false,
  confirmDisabled = false,
  tone = 'default',
}: AlertModalProps) {
  const confirmVariant = tone === 'danger' ? 'danger' : 'confirm'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      closeOnOverlay={!confirmLoading}
      closeOnEsc={!confirmLoading}
      contentClassOnly
      footer={
        <div className={styles.actions}>
          <ActionButton
            type="button"
            variant="confirm"
            onClick={onClose}
            disabled={confirmLoading}
            className={styles.cancelButton}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={confirmDisabled}
            className={styles.confirmButton}
          >
            {confirmLabel}
          </ActionButton>
        </div>
      }
      bodyClassName={styles.body}
      contentClassName={styles.content}
    >
      {message ? <p className={styles.message}>{message}</p> : null}
    </Modal>
  )
}
