import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, token } from '../api'
import Layout from '../components/Layout'

export default function LoginPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const body = Object.fromEntries(new FormData(e.target).entries())
    try {
      const data = await api('/auth/login', 'POST', body)
      token.set(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.error || 'Login failed')
    }
  }

  return (
    <Layout title="Login">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6 md:p-8">
        <h3 className="text-xl font-semibold">HR Login</h3>
        <p className="text-sm text-slate-600 mt-1 mb-4">Enter your username and password.</p>

        <form onSubmit={submit} className="space-y-4">
          <input name="username" placeholder="Username" className="w-full border rounded px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded px-3 py-2" required />
          <p className="text-sm">
            <Link to="/reset-password" className="underline text-slate-700">Reset password</Link>
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full bg-black text-white rounded py-2">Login</button>
        </form>

        <p className="text-sm text-slate-700 mt-4">No account? <Link to="/register" className="text-black underline">Create account</Link></p>
      </div>
    </Layout>
  )
}
