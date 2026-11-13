
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

      // Supabase can return an existing account without an error.
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
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">A</span>
          <span>
            <strong>AgroShift</strong>
            <small>SMART AGRICULTURE</small>
          </span>
        </Link>

        {verificationSent ? (
          <div className="auth-heading">
            <span className="auth-eyebrow">EMAIL VERIFICATION</span>

            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '20px auto',
                borderRadius: '50%',
                background: '#e8f5e9',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
              }}
            >
              ✉
            </div>

            <h1>Verify your email</h1>

            <p>
              Your AgroShift registration has been received.
            </p>

            <div className="auth-success" role="status">
              Check your inbox for a confirmation email sent to:
              <strong style={{ display: 'block', marginTop: '8px' }}>
                {email.trim()}
              </strong>
            </div>

            <p style={{ marginTop: '20px' }}>
              Open the email and click the
              <strong> Confirm Email </strong>
              button to verify your account.
            </p>

            <p style={{ marginTop: '12px' }}>
              After confirmation, you will be redirected to the AgroShift
              landing page. You can then sign in to access your farming tools.
            </p>

            <p style={{ marginTop: '12px', fontSize: '13px' }}>
              Can't find the email? Check your spam or junk folder.
            </p>

            <Link
              to="/login"
              className="auth-verification-link"
              style={{
                display: 'block',
                marginTop: '24px',
                padding: '13px',
                borderRadius: '10px',
                background: '#14532d',
                color: '#ffffff',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-heading">
              <span className="auth-eyebrow">JOIN AGROSHIFT</span>
              <h1>Create your account</h1>
              <p>
                Set up your farmer account to manage your farm digitally.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                required
              />

              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="register-password">Password</label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
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

              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  style={{ width: '100%', paddingRight: '48px' }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
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
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Register
