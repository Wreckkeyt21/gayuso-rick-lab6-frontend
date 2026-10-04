import { useState } from 'react'
import { errorMessage, login, register } from '../api'

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'register') {
        await register(form.username, form.email, form.password)
        setMode('login')
        setNotice('Account created. Please log in.')
        setForm({ ...form, password: '' })
      } else {
        onLogin(await login(form.username, form.password))
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>
        <p className="muted">Product Management System</p>

        {notice && <div className="alert ok">{notice}</div>}
        {error && <div className="alert err">{error}</div>}

        <label>
          {mode === 'login' ? 'Username or email' : 'Username'}
          <input value={form.username} onChange={set('username')} autoComplete="username" required />
        </label>

        {mode === 'register' && (
          <label>
            Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'register' ? 8 : undefined}
            required
          />
        </label>

        <button className="btn primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
            setNotice('')
          }}
        >
          {mode === 'login' ? "No account yet? Register" : 'Have an account? Login'}
        </button>
      </form>
    </div>
  )
}
