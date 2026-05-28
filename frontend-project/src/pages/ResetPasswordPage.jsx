import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../api'

export default function ResetPasswordPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const body = Object.fromEntries(new FormData(e.target).entries())
    try {
      await api('/auth/reset-password', 'POST', body)
      navigate('/login')
    } catch (err) {
      setError(err?.error || 'Failed to reset password')
    }
  }

  return (
    <Layout title="Reset Password">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-1">Reset Password</h3>
        <p className="text-sm text-slate-600 mb-4">Enter your username and set a new password.</p>
        <form onSubmit={submit} className="space-y-4">
          <input name="username" placeholder="Username" className="w-full border rounded px-3 py-2" required />
          <input name="newPassword" type="password" minLength={6} placeholder="New Password" className="w-full border rounded px-3 py-2" required />
          <input name="confirmPassword" type="password" minLength={6} placeholder="Confirm New Password" className="w-full border rounded px-3 py-2" required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full bg-black text-white rounded py-2">Reset Password</button>
        </form>
        <p className="text-sm text-slate-700 mt-4">Back to <Link to="/login" className="underline">Login</Link></p>
      </div>
    </Layout>
  )
}
