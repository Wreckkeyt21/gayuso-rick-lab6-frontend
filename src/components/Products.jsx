import { useCallback, useEffect, useMemo, useState } from 'react'
import { createProduct, deleteProduct, errorMessage, listProducts, updateProduct } from '../api'
import ProductForm from './ProductForm'
import { Icon } from './Icons'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

function StockBadge({ quantity }) {
  const q = Number(quantity)
  if (q <= 10) return <span className="status danger">Low stock</span>
  if (q <= 30) return <span className="status warning">Running low</span>
  return <span className="status success">In stock</span>
}

export default function Products({ products, setProducts }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await listProducts())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [setProducts])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(t)
  }, [notice])

  const filtered = useMemo(() => products.filter((p) => {
    const text = `${p.product_name} ${p.description || ''}`.toLowerCase()
    const matchesQuery = text.includes(query.toLowerCase())
    const q = Number(p.quantity)
    const matchesStock = stockFilter === 'all' || (stockFilter === 'low' ? q <= 10 : q > 10)
    return matchesQuery && matchesStock
  }), [products, query, stockFilter])

  const save = async (payload) => {
    setSaving(true)
    setFormError('')
    try {
      if (editing === 'new') {
        await createProduct(payload)
        setNotice('Product created successfully.')
      } else {
        await updateProduct(editing.id, payload)
        setNotice('Product updated successfully.')
      }
      setEditing(null)
      await reload()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"? This action cannot be undone.`)) return
    try {
      await deleteProduct(p.id)
      setProducts((list) => list.filter((x) => x.id !== p.id))
      setNotice('Product deleted successfully.')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CATALOG</span>
          <h1>Products</h1>
          <p>Manage your products, pricing, and inventory in one place.</p>
        </div>
        <button className="btn primary" onClick={() => { setEditing('new'); setFormError('') }}><Icon name="plus" size={18} /> Add product</button>
      </div>

      {notice && <div className="toast success-toast"><Icon name="check" size={18} />{notice}<button onClick={() => setNotice('')}><Icon name="close" size={15} /></button></div>}
      {error && <div className="alert error-alert"><Icon name="alert" size={17} />{error}</div>}

      <section className="panel product-panel">
        <div className="product-toolbar">
          <div className="search-box"><Icon name="search" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." /></div>
          <div className="filter-wrap">
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
            </select>
          </div>
        </div>

        <div className="product-summary"><span>{loading ? 'Loading products...' : `${filtered.length} of ${products.length} products`}</span><button className="refresh-btn" onClick={reload}><Icon name="layers" size={15} /> Refresh</button></div>

        {loading ? (
          <div className="loading-box"><span className="spinner large" /><strong>Loading your catalog...</strong></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="search" /></div>
            <h3>{products.length ? 'No products found' : 'No products yet'}</h3>
            <p>{products.length ? 'Try changing your search or stock filter.' : 'Create your first product to start building your catalog.'}</p>
            {!products.length && <button className="btn primary" onClick={() => setEditing('new')}><Icon name="plus" size={17} /> Add your first product</button>}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="products-table">
              <thead><tr><th>Product</th><th>Description</th><th>Price</th><th>Quantity</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td><div className="table-product"><div className="product-avatar"><Icon name="box" size={18} /></div><div><strong>{p.product_name}</strong><span>Product #{p.id}</span></div></div></td>
                    <td><span className="table-desc">{p.description || 'No description'}</span></td>
                    <td><strong>{peso.format(Number(p.price))}</strong></td>
                    <td>{p.quantity}</td>
                    <td><StockBadge quantity={p.quantity} /></td>
                    <td><span className="date-cell">{p.created_at || '—'}</span></td>
                    <td><div className="table-actions"><button className="icon-btn edit" title="Edit" onClick={() => { setEditing(p); setFormError('') }}><Icon name="edit" size={17} /></button><button className="icon-btn delete" title="Delete" onClick={() => remove(p)}><Icon name="trash" size={17} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && <ProductForm product={editing === 'new' ? null : editing} onSave={save} onCancel={() => { setEditing(null); setFormError('') }} busy={saving} error={formError} />}
    </main>
  )
}
