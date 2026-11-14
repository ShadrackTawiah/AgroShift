


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
  const [rememberMe, setRememberMe] = useState(true)
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

      navigate('/home', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-background-glow login-glow-one" />
      <div className="login-background-glow login-glow-two" />

      <Link to="/" className="login-brand">
        <span className="login-brand-mark">A</span>
        <span className="login-brand-name">
          <strong>AgroShift</strong>
          <small>SMART AGRICULTURE</small>
        </span>
      </Link>

      <section className="login-glass-card">
        <div className="login-card-heading">
          <span className="login-eyebrow">WELCOME TO AGROSHIFT</span>
          <h1>Login</h1>
          <p>
            Welcome back. Sign in to manage your farm and make smarter
            agricultural decisions.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="login-email">Email address</label>

            <div className="login-input-wrap">
              <input
                id="login-email"
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Password</label>

            <div className="login-input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <span className="login-secure-note">Secure sign in</span>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="login-divider">
          <span />
          <small>NEW TO AGROSHIFT?</small>
          <span />
        </div>

        <p className="login-register-link">
          Don't have an account?{' '}
          <Link to="/register">Create Account</Link>
        </p>

        <Link to="/" className="login-back-home">
          Back to AgroShift Home
        </Link>
      </section>

      <p className="login-page-footer">
        Grow smarter. Farm for tomorrow.
      </p>
    </main>
  )
}

export default Login
