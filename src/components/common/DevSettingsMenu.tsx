import { useCallback, useEffect, useId, useRef, useState } from 'react'
import styles from './DevSettingsMenu.module.css'

type ThemeChoice = 'light' | 'dark' | 'system'
type AiVisibility = 'show' | 'hide'

interface DevSettingsMenuProps {
  isOpen: boolean
  onOpenChange: (nextOpen: boolean) => void
  onRequestOpen?: () => void
}

export function DevSettingsMenu({ isOpen, onOpenChange, onRequestOpen }: DevSettingsMenuProps) {
  const [theme, setTheme] = useState<ThemeChoice>('dark')
  const [aiPanel, setAiPanel] = useState<AiVisibility>('show')
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

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
  }, [isOpen, close])

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
        <div
          id={panelId}
          className={styles.panel}
          role="region"
          aria-label="설정"
        >
          <div className={styles.userRow}>
            <div className={styles.avatar} aria-hidden>
              M
            </div>
            <div className={styles.userText}>
              <p className={styles.greeting}>안녕하세요, MarketLens</p>
              <p className={styles.email}>dev@marketlens.local</p>
            </div>
            <div className={styles.userActions}>
              <button type="button" className={styles.iconGhost} aria-label="알림 (데모)">
                🔔
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>언어</span>
            <button type="button" className={styles.rowValue}>
              한국어
              <span className={styles.chevron} aria-hidden>
                ›
              </span>
            </button>
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>통화</span>
            <button type="button" className={styles.rowValue}>
              KRW
              <span className={styles.chevron} aria-hidden>
                ›
              </span>
            </button>
          </div>

          <div className={styles.segmentBlock}>
            <span className={styles.segmentLabel}>테마</span>
            <div className={styles.segmented} role="group" aria-label="테마">
              {(
                [
                  { id: 'light' as const, label: '라이트' },
                  { id: 'dark' as const, label: '다크' },
                  { id: 'system' as const, label: '시스템' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.segmentBtn} ${theme === id ? styles.segmentBtnActive : ''}`}
                  onClick={() => setTheme(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>구독</span>
            <button type="button" className={styles.rowValue}>
              Free
              <span className={styles.chevron} aria-hidden>
                ›
              </span>
            </button>
          </div>

          <div className={styles.segmentBlock}>
            <span className={styles.segmentLabel}>AI 어시스턴트</span>
            <div className={styles.segmented} role="group" aria-label="AI 어시스턴트 표시">
              <button
                type="button"
                className={`${styles.segmentBtn} ${aiPanel === 'show' ? styles.segmentBtnActive : ''}`}
                onClick={() => setAiPanel('show')}
              >
                표시
              </button>
              <button
                type="button"
                className={`${styles.segmentBtn} ${aiPanel === 'hide' ? styles.segmentBtnActive : ''}`}
                onClick={() => setAiPanel('hide')}
              >
                숨기기
              </button>
            </div>
          </div>

          <div className={styles.links}>
            <button type="button" className={styles.linkBtn}>
              내 페이지
            </button>
            <button type="button" className={styles.linkBtn}>
              계정 설정
            </button>
            <button type="button" className={`${styles.linkBtn} ${styles.linkMuted}`}>
              로그아웃
            </button>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.footerBtn}>
              등록하기
            </button>
            <button type="button" className={styles.footerBtn}>
              API
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
