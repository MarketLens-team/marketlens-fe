import type { KeyboardEventHandler, RefObject } from 'react'
import styles from './TextField.module.css'

export interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  error?: string
  inputRef?: RefObject<HTMLInputElement>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  inputRef,
  onKeyDown,
}: TextFieldProps) {
  const messageId = `${id}-error`

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        onKeyDown={onKeyDown}
      />
      <p id={messageId} className={styles.fieldMessage} role="alert">
        {error ?? '\u00A0'}
      </p>
    </div>
  )
}
