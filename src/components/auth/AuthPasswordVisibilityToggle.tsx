import styles from './AuthPanel.module.css'

type AuthPasswordVisibilityToggleProps = {
  visible: boolean
  onToggle: () => void
}

function IconEye() {
  return (
    <svg className={styles.toggleIcon} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg className={styles.toggleIcon} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 3l18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.45 18.45 0 0 1-2.91 3.72M6.12 6.12A18.45 18.45 0 0 0 2 12s3 7 10 7a10.9 10.9 0 0 0 2.12-.26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AuthPasswordVisibilityToggle({ visible, onToggle }: AuthPasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggleVisibility}
      onClick={onToggle}
      aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
      aria-pressed={visible}
    >
      {visible ? <IconEye /> : <IconEyeOff />}
    </button>
  )
}
