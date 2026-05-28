const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const token = {
  get: () => localStorage.getItem('token'),
  set: (value) => localStorage.setItem('token', value),
  clear: () => localStorage.removeItem('token'),
}

export async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token.get()) headers.Authorization = `Bearer ${token.get()}`

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw data
  return data
}
