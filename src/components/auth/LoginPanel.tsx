import { useState } from 'react'
import styles from './LoginPanel.module.css'

export interface LoginPanelProps {
  onSubmit: (email: string, password: string) => void
}

export default function LoginPanel({ onSubmit }: LoginPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(email, password)
  }

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden />
      <main className={styles.panel}>
        <div className={styles.brand}>Market Lens</div>
        <h1 className={styles.title}>회원 로그인</h1>
        <p className={styles.subtitle}>거래를 시작하려면 로그인하세요</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="email">
            이메일 주소
          </label>
          <input
            id="email"
            className={styles.input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            type="email"
            required
          />

          <label className={styles.label} htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            required
          />

          <button className={styles.submit} type="submit">
            로그인
          </button>
        </form>

        <p className={styles.helpText}>비밀번호를 잊으셨나요?</p>
        <p className={styles.joinText}>아직 계정이 없으신가요? 회원가입하기</p>
      </main>
    </div>
  )
}
