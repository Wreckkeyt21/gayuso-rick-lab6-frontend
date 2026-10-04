import { useEffect, useState } from 'react'
import { getAuth, logout } from './api'
import AuthForm from './components/AuthForm'
import Products from './components/Products'
import './App.css'

export default function App() {
  const [auth, setAuth] = useState(getAuth)

  // api.js fires this when a token can no longer be refreshed
  useEffect(() => {
    const onLogout = () => setAuth(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const handleLogout = async () => {
    await logout()
    setAuth(null)
  }

  if (!auth) return <AuthForm onLogin={setAuth} />

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Product Management</h1>
        <div className="who">
          <span>
            {auth.user.username} <small>({auth.user.role})</small>
          </span>
          <button className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <Products />
    </div>
  )
}
