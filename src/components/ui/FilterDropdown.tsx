import clsx from 'clsx'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import styles from './FilterDropdown.module.css'

export interface FilterDropdownOption {
  value: string
  label: string
}

export interface FilterDropdownProps {
  value: string
  options: FilterDropdownOption[]
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
}

export function FilterDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: FilterDropdownProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? value,
    [options, value],
  )

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [close, isOpen])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    close()
  }

  return (
    <div className={clsx(styles.wrap, className)} ref={wrapRef}>
      <button
        type="button"
        className={clsx(styles.trigger, isOpen && styles.triggerOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.triggerLabel}>{selectedLabel}</span>
        <span className={styles.triggerChevron} aria-hidden>
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <ul id={listId} className={styles.list} role="listbox" aria-label={ariaLabel}>
            {options.map((option) => {
              const isSelected = value === option.value
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={clsx(styles.option, isSelected && styles.optionSelected)}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className={styles.optionCheck} aria-hidden>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{option.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
