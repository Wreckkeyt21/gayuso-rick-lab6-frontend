import { useState } from 'react'

const empty = { product_name: '', description: '', price: '', quantity: '' }

export default function ProductForm({ product, onSave, onCancel, busy, error }) {
  const [form, setForm] = useState(
    product
      ? {
          product_name: product.product_name,
          description: product.description ?? '',
          price: String(product.price),
          quantity: String(product.quantity),
        }
      : empty,
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    onSave({
      product_name: form.product_name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    })
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{product ? `Edit product #${product.id}` : 'Add product'}</h2>
      {error && <div className="alert err">{error}</div>}

      <label>
        Product name
        <input value={form.product_name} onChange={set('product_name')} maxLength={100} required />
      </label>

      <label>
        Description
        <textarea rows={3} value={form.description} onChange={set('description')} />
      </label>

      <div className="row">
        <label>
          Price (₱)
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
        </label>
        <label>
          Quantity
          <input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required />
        </label>
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : product ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
