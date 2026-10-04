import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const STORAGE_KEY = 'pm_auth'

// ---- token storage ---------------------------------------------------------
export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
const saveAuth = (auth) => localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
const clearAuth = () => localStorage.removeItem(STORAGE_KEY)

// ---- axios instance --------------------------------------------------------
const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAuth()?.tokens?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401: try ONE refresh (shared by concurrent requests), then retry.
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    const isAuthCall = config?.url?.includes('/login') || config?.url?.includes('/refresh')

    if (response?.status === 401 && config && !config._retry && !isAuthCall) {
      config._retry = true
      const auth = getAuth()
      if (auth?.tokens?.refresh_token) {
        try {
          refreshing ??= axios
            .post(`${BASE}/api/refresh`, { refresh_token: auth.tokens.refresh_token })
            .finally(() => { refreshing = null })
          const { data } = await refreshing
          saveAuth({ ...auth, tokens: data.tokens })
          config.headers.Authorization = `Bearer ${data.tokens.access_token}`
          return api(config)
        } catch {
          // refresh failed -> fall through to logout
        }
      }
      clearAuth()
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  },
)

// ---- helpers ---------------------------------------------------------------
export function errorMessage(err) {
  const data = err?.response?.data
  if (data?.errors) return Object.values(data.errors).join(' ')
  if (data?.error) return data.error
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the API. Is the server running / is CORS configured?'
  return err?.message || 'Something went wrong.'
}

// ---- auth ------------------------------------------------------------------
export async function login(username, password) {
  const { data } = await api.post('/login', { username, password })
  const auth = { user: data.user, tokens: data.tokens }
  saveAuth(auth)
  return auth
}

export const register = (username, email, password) =>
  api.post('/register', { username, email, password }).then((r) => r.data)

export async function logout() {
  const refresh_token = getAuth()?.tokens?.refresh_token
  clearAuth()
  try {
    if (refresh_token) await axios.post(`${BASE}/api/logout`, { refresh_token })
  } catch {
    /* token will simply expire server-side */
  }
}

// ---- products --------------------------------------------------------------
export const listProducts = () => api.get('/products').then((r) => r.data.data)
export const createProduct = (p) => api.post('/products', p).then((r) => r.data.data)
export const updateProduct = (id, p) => api.put(`/products/${id}`, p).then((r) => r.data.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data)
