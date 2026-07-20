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
      setEmail('')
      setPassword('')
      setStatus('idle')
    } else {
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
          <h1 className="font-display text-4xl font-bold text-[var(--color-ink)] flex items-center justify-center gap-3">
            <img
              src="/favicon.svg"
              alt="Catch logo"
              className="h-11 w-11"
              style={{
                borderRadius: '10px',
                border: '3px solid var(--color-ink)',
                boxShadow: '3px 3px 0 var(--color-ink)',
              }}
            />
            Catch
          </h1>
          <p className="mt-3 font-display text-sm font-medium text-[var(--color-ink-soft)]">
            Your links, saved somewhere on purpose.
          </p>
        </div>

        {status === 'email-confirm' ? (
          <div
            className="p-6 text-center"
            style={{
              border: '3px solid var(--color-ink)',
              borderRadius: '16px',
              background: 'var(--color-surface)',
              boxShadow: '4px 4px 0 var(--color-ink)',
            }}
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
              className="mt-4 font-display text-sm font-bold text-[var(--color-accent-dark)] hover:underline"
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
              className="w-full text-sm font-medium text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
              style={{
                border: '3px solid var(--color-ink)',
                borderRadius: '12px',
                padding: '14px 16px',
                background: 'var(--color-surface)',
                boxShadow: '3px 3px 0 var(--color-ink)',
              }}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 text-sm font-medium text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
                style={{
                  border: '3px solid var(--color-ink)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  background: 'var(--color-surface)',
                  boxShadow: '3px 3px 0 var(--color-ink)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-ink)] hover:text-[var(--color-accent-dark)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full text-sm font-bold text-white disabled:opacity-60"
              style={{
                background: 'var(--color-accent)',
                border: '3px solid var(--color-ink)',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '4px 4px 0 var(--color-ink)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
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
                className="text-xs font-bold text-[var(--color-danger)]"
                style={{
                  border: '2px solid var(--color-danger)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  background: 'var(--color-danger-soft)',
                  boxShadow: '2px 2px 0 var(--color-danger)',
                }}
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
                className="font-display text-xs font-bold text-[var(--color-ink-faint)] hover:text-[var(--color-accent-dark)]"
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
