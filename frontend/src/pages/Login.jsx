
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const { error } = await signIn({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(
          error.message === 'Email not confirmed'
            ? 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
            : error.message
        )
        return
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">A</span>
          <span>
            <strong>AgroShift</strong>
            <small>SMART AGRICULTURE</small>
          </span>
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">FARMER ACCOUNT</span>
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your farm and access your agricultural insights.
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              style={{ width: '100%', paddingRight: '48px' }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '19px',
                padding: '5px',
              }}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-switch">
          <Link to="/">Back to AgroShift Home</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
