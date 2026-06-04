import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import styles from './OtpCodeInput.module.css'

const OTP_LENGTH = 6

export interface OtpCodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string | null
}

export function OtpCodeInput({ value, onChange, disabled = false, error }: OtpCodeInputProps) {
  const groupId = useId()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  const updateDigits = (nextDigits: string[]) => {
    onChange(nextDigits.join('').slice(0, OTP_LENGTH))
  }

  const handleChange = (index: number, nextChar: string) => {
    const sanitized = nextChar.replace(/\D/g, '')
    const nextDigits = [...digits]

    if (!sanitized) {
      nextDigits[index] = ''
      updateDigits(nextDigits)
      return
    }

    const chars = sanitized.split('')
    nextDigits[index] = chars[0]
    let cursor = index + 1
    for (let offset = 1; offset < chars.length && cursor < OTP_LENGTH; offset += 1) {
      nextDigits[cursor] = chars[offset]
      cursor += 1
    }
    updateDigits(nextDigits)
    if (cursor < OTP_LENGTH) {
      focusIndex(cursor)
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
      return
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusIndex(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    onChange(pasted)
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.group} role="group" aria-labelledby={groupId} aria-invalid={Boolean(error)}>
        <span id={groupId} className={styles.srOnly}>
          이메일 인증 코드 6자리
        </span>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            className={`${styles.cell} ${error ? styles.cellError : ''}`.trim()}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.currentTarget.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`인증 코드 ${index + 1}번째 자리`}
            maxLength={1}
            disabled={disabled}
          />
        ))}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
