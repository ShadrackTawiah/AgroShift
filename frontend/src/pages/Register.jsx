


import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Register() {
  const { signUp } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.user?.identities?.length === 0) {
        setError(
          'An account with this email may already exist. Please sign in or use another email address.'
        )
        return
      }

      if (data?.session) {
        setError(
          'Your account was created with an active session. Please sign in to continue.'
        )
        return
      }

      if (!data?.user) {
        setError('We could not confirm your registration. Please try again.')
        return
      }

      setVerificationSent(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <div className="register-background-glow">
        <span className="register-glow-one" />
        <span className="register-glow-two" />
      </div>

      <Link to="/" className="register-brand">
        <span className="register-brand-mark">A</span>
        <span className="register-brand-name">
          <strong>AgroShift</strong>
          <small>SMART AGRICULTURE</small>
        </span>
      </Link>

      <section className="register-glass-card">
        {verificationSent ? (
          <div className="register-verification">
            <span className="register-eyebrow">EMAIL VERIFICATION</span>

            <div className="register-verification-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M4 7L12 13L20 7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1>Verify your email</h1>

            <p className="register-description">
              Your AgroShift registration has been received.
            </p>

            <div className="register-success" role="status">
              Check your inbox for a confirmation email sent to:
              <strong>{email.trim()}</strong>
            </div>

            <p className="register-verification-text">
              Open the email and click the <strong>Confirm Email</strong>{' '}
              button to verify your account.
            </p>

            <p className="register-verification-text">
              After confirmation, you will be redirected to the AgroShift
              landing page. You can then sign in to access your farming tools.
            </p>

            <p className="register-spam-note">
              Can't find the email? Check your spam or junk folder.
            </p>

            <Link to="/login" className="register-submit">
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="register-heading">
              <span className="register-eyebrow">JOIN AGROSHIFT</span>
              <h1>Create your account</h1>
              <p className="register-description">
                Set up your farmer account and manage your farm digitally.
              </p>
            </div>

            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="register-form-group">
                <label htmlFor="register-name">Full name</label>

                <div className="register-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="12"
                      cy="8"
                      r="3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M5 20C5 16.7 8.1 14.5 12 14.5C15.9 14.5 19 16.7 19 20"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label htmlFor="register-email">Email address</label>

                <div className="register-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M4 7L12 13L20 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label htmlFor="register-password">Password</label>

                <div className="register-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V7a4 4 0 018 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="register-form-group">
                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="register-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V7a4 4 0 018 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="register-divider">
              <span>ALREADY REGISTERED?</span>
            </div>

            <p className="register-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </section>

      <Link to="/" className="register-back-home">
        ← Back to AgroShift Home
      </Link>

      <footer className="register-footer">
        Grow smarter. Farm for tomorrow.
      </footer>
    </main>
  )
}

export default Register
