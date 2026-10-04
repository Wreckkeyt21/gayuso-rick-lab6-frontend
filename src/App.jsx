import { useEffect, useMemo, useState } from 'react'
import { getAuth, logout } from './api'
import AuthForm from './components/AuthForm'
import Products from './components/Products'
import { Icon } from './components/Icons'
import './App.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'products', label: 'Products', icon: 'box' },
]

function Dashboard({ products, onProducts }) {
  const totalValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0)
  const lowStock = products.filter((p) => Number(p.quantity) <= 10)
  const totalUnits = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Good to see you, {products._username || 'there'}.</h1>
          <p>Keep track of your catalog and inventory from one place.</p>
        </div>
        <button className="btn primary" onClick={onProducts}>
          <Icon name="plus" size={18} /> Add product
        </button>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon blue"><Icon name="box" /></div>
          <div><span>Total products</span><strong>{products.length}</strong><small>Items in your catalog</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon indigo"><Icon name="layers" /></div>
          <div><span>Total units</span><strong>{totalUnits}</strong><small>Available inventory</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon green"><Icon name="wallet" /></div>
          <div><span>Inventory value</span><strong>₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong><small>Current stock value</small></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon red"><Icon name="alert" /></div>
          <div><span>Low stock</span><strong>{lowStock.length}</strong><small>{lowStock.length ? 'Needs attention' : 'Everything looks good'}</small></div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div><h2>Inventory snapshot</h2><p>Your most recently added products</p></div>
            <button className="text-btn" onClick={onProducts}>View all <Icon name="arrow" size={15} /></button>
          </div>
          {products.length === 0 ? (
            <div className="empty-state compact">
              <div className="empty-icon"><Icon name="box" /></div>
              <h3>Your catalog is empty</h3>
              <p>Add your first product to start managing inventory.</p>
              <button className="btn primary" onClick={onProducts}>Create product</button>
            </div>
          ) : (
            <div className="mini-list">
              {products.slice(0, 5).map((p) => (
                <div className="mini-row" key={p.id}>
                  <div className="product-avatar"><Icon name="box" size={18} /></div>
                  <div className="mini-info"><strong>{p.product_name}</strong><span>{p.description || 'No description'}</span></div>
                  <div className="mini-price">₱{Number(p.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  <StockBadge quantity={p.quantity} />
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel quick-panel">
          <div className="panel-header"><div><h2>Quick actions</h2><p>Common inventory tasks</p></div></div>
          <button className="quick-action" onClick={onProducts}>
            <span className="quick-icon blue"><Icon name="plus" /></span>
            <span><strong>Add a product</strong><small>Create a new catalog item</small></span>
            <Icon name="arrow" size={16} />
          </button>
          <button className="quick-action" onClick={onProducts}>
            <span className="quick-icon indigo"><Icon name="search" /></span>
            <span><strong>Browse products</strong><small>Search and manage your catalog</small></span>
            <Icon name="arrow" size={16} />
          </button>
          <div className="tip-card">
            <div className="tip-icon"><Icon name="spark" size={18} /></div>
            <div><strong>Inventory tip</strong><p>Products with 10 units or less are marked as low stock.</p></div>
          </div>
        </article>
      </section>
    </main>
  )
}

function StockBadge({ quantity }) {
  const q = Number(quantity)
  if (q <= 10) return <span className="status danger">Low stock</span>
  if (q <= 30) return <span className="status warning">Running low</span>
  return <span className="status success">In stock</span>
}

export default function App() {
  const [auth, setAuth] = useState(getAuth)
  const [page, setPage] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onLogout = () => setAuth(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const handleLogout = async () => {
    await logout()
    setAuth(null)
  }

  const currentLabel = useMemo(
    () => navItems.find((item) => item.id === page)?.label || 'Dashboard',
    [page],
  )

  if (!auth) return <AuthForm onLogin={setAuth} />

  const user = auth.user || {}
  const productsWithUser = Object.assign(products, { _username: user.username })

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Icon name="layers" size={22} /></div>
          <div><strong>LavaLust</strong><span>Product Manager</span></div>
        </div>

        <nav>
          <span className="nav-label">Workspace</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSidebarOpen(false) }}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon"><Icon name="spark" size={17} /></div>
            <strong>Stay organized</strong>
            <span>Keep your product data up to date.</span>
          </div>
          <button className="logout-link" onClick={handleLogout}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name="menu" /></button>
          <div className="crumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{currentLabel}</strong></div>
          <div className="top-actions">
            <div className="user-menu">
              <div className="avatar">{(user.username || user.email || 'U').charAt(0).toUpperCase()}</div>
              <div className="user-copy"><strong>{user.username || 'User'}</strong><span>{user.email || user.role || 'Account'}</span></div>
            </div>
          </div>
        </header>

        {page === 'dashboard' ? (
          <Dashboard products={productsWithUser} onProducts={() => setPage('products')} />
        ) : (
          <Products products={products} setProducts={setProducts} />
        )}
      </div>

      {sidebarOpen && <button className="overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}
