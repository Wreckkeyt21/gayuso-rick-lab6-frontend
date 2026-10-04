import { useEffect, useState } from 'react'
import { Icon } from './Icons'

const empty = { product_name: '', description: '', price: '', quantity: '' }

export default function ProductForm({ product, onSave, onCancel, busy, error }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(product ? {
      product_name: product.product_name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      quantity: String(product.quantity ?? ''),
    } : empty)
  }, [product])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
    <div className="modal-backdrop">
      <form className="modal-card product-modal" onSubmit={submit}>
        <div className="modal-header">
          <div><span className="eyebrow">{product ? 'UPDATE CATALOG' : 'NEW CATALOG ITEM'}</span><h2>{product ? 'Edit product' : 'Add a product'}</h2><p>{product ? `Update product #${product.id} details.` : 'Add a new item to your product catalog.'}</p></div>
          <button type="button" className="icon-btn" onClick={onCancel}><Icon name="close" /></button>
        </div>

        {error && <div className="alert error-alert"><Icon name="alert" size={17} />{error}</div>}

        <div className="form-grid">
          <label className="field field-full"><span>Product name</span><input value={form.product_name} onChange={set('product_name')} maxLength={100} placeholder="e.g. Wireless Keyboard" required /></label>
          <label className="field field-full"><span>Description <small>Optional</small></span><textarea rows={4} value={form.description} onChange={set('description')} placeholder="Add a short description of the product..." /></label>
          <label className="field"><span>Price</span><div className="money-input"><b>₱</b><input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" required /></div></label>
          <label className="field"><span>Quantity</span><input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} placeholder="0" required /></label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving...</> : <><Icon name="check" size={17} /> {product ? 'Save changes' : 'Create product'}</>}</button>
        </div>
      </form>
    </div>
  )
}
