import { useState } from 'react'
import { errorMessage, login, register } from '../api'
import { Icon } from './Icons'

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    try {
      if (mode === 'register') {
        await register(form.username.trim(), form.email.trim(), form.password)
        setMode('login')
        setNotice('Account created successfully. You can now sign in.')
        setForm((prev) => ({ ...prev, password: '' }))
      } else {
        onLogin(await login(form.email.trim(), form.password))
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />

      <section className="auth-showcase">
        <div className="showcase-brand"><div className="brand-mark large"><Icon name="layers" size={25} /></div><strong>LavaLust</strong></div>
        <div className="showcase-content">
          <span className="eyebrow light">PRODUCT MANAGEMENT</span>
          <h1>Everything you need to manage your products.</h1>
          <p>A clean workspace for organizing your catalog, monitoring inventory, and keeping your product data up to date.</p>
          <div className="showcase-points">
            <div><span><Icon name="check" size={16} /></span> Simple inventory management</div>
            <div><span><Icon name="check" size={16} /></span> Secure account access</div>
            <div><span><Icon name="check" size={16} /></span> Fast product updates</div>
          </div>
        </div>
        <small className="showcase-footer">Built for your Laboratory Exercise No. 6</small>
      </section>

      <section className="auth-side">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand"><div className="brand-mark"><Icon name="layers" size={21} /></div><strong>LavaLust</strong></div>
          <div className="auth-heading">
            <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span>
            <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
            <p>{mode === 'login' ? 'Enter your details to access your workspace.' : 'Create an account to start managing products.'}</p>
          </div>

          {notice && <div className="alert success-alert"><Icon name="check" size={17} />{notice}</div>}
          {error && <div className="alert error-alert"><Icon name="alert" size={17} />{error}</div>}

          {mode === 'register' && (
            <label className="field">
              <span>Username</span>
              <div className="input-wrap"><input value={form.username} onChange={set('username')} autoComplete="username" placeholder="Choose a username" required /></div>
            </label>
          )}

          <label className="field">
            <span>Email address</span>
            <div className="input-wrap"><input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required /></div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} placeholder="Enter your password" required />
              <button type="button" className="input-icon" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} /></button>
            </div>
          </label>

          <button className="btn primary full auth-submit" disabled={busy}>
            {busy ? <><span className="spinner" /> Please wait...</> : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <div className="auth-switch">
            <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
            <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNotice('') }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="auth-copyright">© 2026 LavaLust Product Management</p>
      </section>
    </div>
  )
}
