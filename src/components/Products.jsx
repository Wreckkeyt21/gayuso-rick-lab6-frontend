import { useCallback, useEffect, useState } from 'react'
import { createProduct, deleteProduct, errorMessage, listProducts, updateProduct } from '../api'
import ProductForm from './ProductForm'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

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
  }, [])

  // Initial fetch (loading is already true on first render)
  useEffect(() => {
    let active = true
    listProducts()
      .then((rows) => active && setProducts(rows))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const closeForm = () => {
    setEditing(null)
    setFormError('')
  }

  const save = async (payload) => {
    setSaving(true)
    setFormError('')
    try {
      if (editing === 'new') await createProduct(payload)
      else await updateProduct(editing.id, payload)
      closeForm()
      await reload()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(p.id)
      setProducts((list) => list.filter((x) => x.id !== p.id))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <main className="content">
      <div className="toolbar">
        <h2>Products {!loading && <small>({products.length})</small>}</h2>
        {!editing && (
          <button className="btn primary" onClick={() => setEditing('new')}>
            + Add product
          </button>
        )}
      </div>

      {error && <div className="alert err">{error}</div>}

      {editing && (
        <ProductForm
          key={editing === 'new' ? 'new' : editing.id}
          product={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={closeForm}
          busy={saving}
          error={formError}
        />
      )}

      <div className="card table-wrap">
        {loading ? (
          <p className="muted pad">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="muted pad">No products yet. Click “Add product” to create one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th className="num">Price</th>
                <th className="num">Qty</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="strong">{p.product_name}</td>
                  <td className="desc">{p.description}</td>
                  <td className="num">{peso.format(p.price)}</td>
                  <td className="num">{p.quantity}</td>
                  <td className="nowrap">{p.created_at}</td>
                  <td className="nowrap">
                    <button className="btn small" onClick={() => setEditing(p)}>
                      Edit
                    </button>{' '}
                    <button className="btn small danger" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
