import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useModal } from '../../hooks/useModal'
import styles from './Modal.module.css'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** 병합되어 `.content`에 적용. 예: 더 넓은 모달 `max-width` */
  contentClassName?: string
}

export function Modal({ isOpen, onClose, children, contentClassName }: ModalProps) {
  useModal(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={clsx(styles.content, contentClassName)}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
