import { useCallback, useEffect, useId, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUserPreferencesStore } from '../../store/userPreferencesStore'
import styles from './TopNavSettingsMenu.module.css'

interface TopNavSettingsMenuProps {
  isOpen: boolean
  onOpenChange: (nextOpen: boolean) => void
  onRequestOpen?: () => void
}

export function TopNavSettingsMenu({ isOpen, onOpenChange, onRequestOpen }: TopNavSettingsMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { theme, language, currency, aiAssistant, setTheme, setAiAssistant } = useUserPreferencesStore()

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [close, isOpen])

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        aria-label="설정 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          if (!isOpen) onRequestOpen?.()
          onOpenChange(!isOpen)
        }}
      >
        ⚙
      </button>

      {isOpen ? (
        <div id={panelId} className={styles.panel} role="region" aria-label="설정">
          <div className={styles.row}>
            <span className={styles.label}>언어</span>
            <span className={styles.value}>{language === 'ko' ? '한국어' : language}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>통화</span>
            <span className={styles.value}>{currency}</span>
          </div>
          <div className={styles.segmentBlock}>
            <span className={styles.segmentLabel}>테마</span>
            <div className={styles.segmented} role="group" aria-label="테마">
              {(['light', 'dark', 'system'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.segmentBtn} ${theme === id ? styles.segmentBtnActive : ''}`}
                  onClick={() => setTheme(id)}
                >
                  {id === 'light' ? '라이트' : id === 'dark' ? '다크' : '시스템'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.segmentBlock}>
            <span className={styles.segmentLabel}>AI 어시스턴트</span>
            <div className={styles.segmented} role="group" aria-label="AI 어시스턴트 표시">
              <button
                type="button"
                className={`${styles.segmentBtn} ${aiAssistant === 'show' ? styles.segmentBtnActive : ''}`}
                onClick={() => setAiAssistant('show')}
              >
                표시
              </button>
              <button
                type="button"
                className={`${styles.segmentBtn} ${aiAssistant === 'hide' ? styles.segmentBtnActive : ''}`}
                onClick={() => setAiAssistant('hide')}
              >
                숨기기
              </button>
            </div>
          </div>
          <div className={styles.linkGroup}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                close()
                navigate('/watchlist')
              }}
            >
              관심 목록 페이지
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                logout()
                close()
                navigate('/login')
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
