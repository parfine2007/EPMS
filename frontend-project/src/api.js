const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const token = {
  get: () => localStorage.getItem('token'),
  set: (value) => localStorage.setItem('token', value),
  clear: () => localStorage.removeItem('token'),
}

export async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token.get()) headers.Authorization = `Bearer ${token.get()}`

  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw { error: 'Unable to reach the server. Please try again.' }
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json()
    : { error: (await res.text()) || 'The server returned an empty response.' }

  if (!res.ok) throw data
  return data
}
