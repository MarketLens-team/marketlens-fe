import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useModal } from '../../hooks/useModal'
import styles from './Modal.module.css'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  headerMeta?: ReactNode
  footer?: ReactNode
  showCloseButton?: boolean
  closeButtonLabel?: string
  closeOnEsc?: boolean
  closeOnOverlay?: boolean
  lockBackgroundScroll?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  bodyClassName?: string
  /** 병합되어 `.content`에 적용. 예: 더 넓은 모달 `max-width` */
  contentClassName?: string
  /** true면 `.content` 기본 스타일 없이 `contentClassName`만 적용 (검색 모달 등) */
  contentClassOnly?: boolean
  /** 오버레이 래퍼에 추가 클래스 (검색 모달 상·하단 여백 등) */
  overlayClassName?: string
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
  )
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  headerMeta,
  footer,
  showCloseButton = true,
  closeButtonLabel = '닫기',
  closeOnEsc = true,
  closeOnOverlay = true,
  lockBackgroundScroll = false,
  initialFocusRef,
  bodyClassName,
  contentClassName,
  contentClassOnly = false,
  overlayClassName,
}: ModalProps) {
  useModal(isOpen && lockBackgroundScroll)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const overlayPointerDownRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const nextTick = window.requestAnimationFrame(() => {
      const explicitTarget = initialFocusRef?.current
      if (explicitTarget) {
        explicitTarget.focus()
        return
      }
      if (showCloseButton) {
        closeButtonRef.current?.focus()
        return
      }
      const dialog = dialogRef.current
      if (!dialog) return
      const [firstFocusable] = getFocusableElements(dialog)
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        dialog.focus()
      }
    })
    return () => window.cancelAnimationFrame(nextTick)
  }, [initialFocusRef, isOpen, showCloseButton])

  useEffect(() => {
    if (isOpen) return
    restoreFocusRef.current?.focus()
  }, [isOpen])

  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && closeOnEsc) {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const dialog = dialogRef.current
    if (!dialog) return
    const focusables = getFocusableElements(dialog)
    if (!focusables.length) {
      e.preventDefault()
      dialog.focus()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
      return
    }
    if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className={clsx('modal-overlay', overlayClassName)}
      role="presentation"
      onMouseDown={(e) => {
        overlayPointerDownRef.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (!closeOnOverlay) return
        const isPureOverlayClick = e.target === e.currentTarget && overlayPointerDownRef.current
        overlayPointerDownRef.current = false
        if (isPureOverlayClick) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={
          contentClassOnly
            ? contentClassName
            : clsx(styles.content, contentClassName)
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || headerMeta || showCloseButton) ? (
          <header
            className={clsx(
              styles.header,
              showCloseButton && !title && !headerMeta && styles.headerCloseOnly,
            )}
          >
            <div className={styles.headingGroup}>
              {title ? (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              ) : null}
              {headerMeta ? <div className={styles.meta}>{headerMeta}</div> : null}
            </div>
            {showCloseButton ? (
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.closeButton}
                aria-label={closeButtonLabel}
                onClick={onClose}
              >
                ×
              </button>
            ) : null}
          </header>
        ) : null}
        <div className={clsx(styles.body, bodyClassName)}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
