import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Layout from '../components/Layout'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const body = Object.fromEntries(new FormData(e.target).entries())

    if (body.password !== body.confirmPassword) {
      setError('Password and confirm password do not match')
      return
    }

    try {
      await api('/auth/register', 'POST', body)
      e.target.reset()
      navigate('/login')
    } catch (err) {
      setError(err?.error || 'Registration failed')
    }
  }

  return (
    <Layout title="Create Account">
      <div className="max-w-md mx-auto bg-white rounded shadow p-4 space-y-3">
        <h2 className="font-semibold">Register HR Account</h2>
        <form onSubmit={submit} className="space-y-3">
          <input name="fullName" placeholder="Full Name" className="w-full border rounded px-3 py-2" required />
          <input name="username" placeholder="Username" minLength={3} className="w-full border rounded px-3 py-2" required />
          <input name="password" type="password" minLength={6} placeholder="Password" className="w-full border rounded px-3 py-2" required />
          <input name="confirmPassword" type="password" minLength={6} placeholder="Confirm Password" className="w-full border rounded px-3 py-2" required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="w-full bg-black text-white rounded py-2">Register</button>
        </form>
        <p className="text-sm text-slate-600">Already have account? <Link to="/login" className="text-black underline">Login</Link></p>
      </div>
    </Layout>
  )
}
