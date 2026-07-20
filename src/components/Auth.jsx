import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error | email-confirm
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSignUp(e) {
    e.preventDefault()
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else if (data.session) {
      // Email confirmation is disabled in Supabase — session created immediately
      // App.jsx's auth listener will pick it up
      setEmail('')
      setPassword('')
      setStatus('idle')
    } else {
      // Email confirmation is enabled — user must verify email first
      setStatus('email-confirm')
    }
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      // Success — App.jsx's auth listener will pick up the session
      setEmail('')
      setPassword('')
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* ── Logo ── */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--color-ink)]">
            <span
              className="mr-2 inline-block h-8 w-8 rounded-md border-3 border-[var(--color-ink)]"
              style={{ background: 'var(--color-accent)', boxShadow: '3px 3px 0 var(--color-ink)', verticalAlign: 'middle' }}
            />
            Catch
          </h1>
          <p className="mt-3 font-display text-sm font-medium text-[var(--color-ink-soft)]">
            Your links, saved somewhere on purpose.
          </p>
        </div>

        {status === 'email-confirm' ? (
          <div
            className="neu-card p-6 text-center"
          >
            <p className="font-display text-sm font-semibold text-[var(--color-ink)]">
              Check <span className="font-bold">{email}</span> to confirm your account.
            </p>
            <p className="mt-3 text-xs font-medium text-[var(--color-ink-faint)]">
              After confirming, come back and sign in with your password.
            </p>
            <button
              onClick={() => {
                setStatus('idle')
                setEmail('')
                setPassword('')
              }}
              className="mt-4 font-display text-sm font-bold text-[var(--color-accent)] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form
            onSubmit={mode === 'signup' ? handleSignUp : handleSignIn}
            className="space-y-3"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neu-input w-full"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink)] hover:text-[var(--color-accent)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="neu-btn neu-btn-primary w-full py-3 text-sm"
            >
              {status === 'loading'
                ? mode === 'signup'
                  ? 'Creating account\u2026'
                  : 'Signing in\u2026'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Sign in'}
            </button>

            {status === 'error' && (
              <p
                className="rounded-lg border-2 border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-3 py-2 text-xs font-bold text-[var(--color-danger)]"
                style={{ boxShadow: '2px 2px 0 var(--color-danger)' }}
              >
                {errorMsg}
              </p>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setErrorMsg('')
                  setStatus('idle')
                }}
                className="font-display text-xs font-bold text-[var(--color-ink-faint)] hover:text-[var(--color-accent)]"
              >
                {mode === 'signin'
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs font-medium text-[var(--color-ink-faint)]">
          {mode === 'signin'
            ? 'Sign in with your email and password.'
            : 'Create an account with your email and a password.'}
        </p>
      </div>
    </div>
  )
}
