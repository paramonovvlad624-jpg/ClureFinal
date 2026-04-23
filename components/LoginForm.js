import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function LoginForm({ onLoginSuccess }) {
  const { login, signup, error: authError } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        if (!displayName.trim()) {
          setError('Please enter a display name')
          setLoading(false)
          return
        }
        await signup(email, password, displayName)
      } else {
        await login(email, password)
      }
      onLoginSuccess?.()
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>{isSignup ? 'Create Account' : 'Login'}</h2>
        
        {(error || authError) && (
          <div className={styles.error}>{error || authError}</div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Login')}
          </button>
        </form>

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => {
            setIsSignup(!isSignup)
            setError('')
          }}
          disabled={loading}
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
