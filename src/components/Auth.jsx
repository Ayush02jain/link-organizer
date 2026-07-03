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
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl text-[var(--color-ink)]">Catch</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Your links, saved somewhere on purpose.
          </p>
        </div>

        {status === 'email-confirm' ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            <p className="text-sm text-[var(--color-ink)]">
              Check <span className="font-medium">{email}</span> to confirm your account.
            </p>
            <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
              After confirming, come back and sign in with your password.
            </p>
            <button
              onClick={() => {
                setStatus('idle')
                setEmail('')
                setPassword('')
              }}
              className="mt-4 text-sm text-[var(--color-accent)] hover:underline"
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
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 pr-10 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-ink)] disabled:opacity-60"
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
              <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
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
                className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-accent)]"
              >
                {mode === 'signin'
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)]">
          {mode === 'signin'
            ? 'Sign in with your email and password.'
            : 'Create an account with your email and a password.'}
        </p>
      </div>
    </div>
  )
}
