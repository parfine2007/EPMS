import { NavLink, useNavigate } from 'react-router-dom'
import { token } from '../api'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = !!token.get()

  const logout = () => {
    token.clear()
    navigate('/login')
  }

  return (
    <nav className="fixed top-16 left-0 right-0 z-40 bg-slate-800 text-white border-t border-slate-700 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
        {loggedIn ? (
          <>
            <NavLink to="/dashboard" className="px-3 py-1 rounded bg-slate-700">Dashboard</NavLink>
            <NavLink to="/employees" className="px-3 py-1 rounded bg-slate-700">Employees</NavLink>
            <NavLink to="/salary" className="px-3 py-1 rounded bg-slate-700">Salary</NavLink>
            <NavLink to="/departments" className="px-3 py-1 rounded bg-slate-700">Department</NavLink>
            <NavLink to="/reports" className="px-3 py-1 rounded bg-slate-700">Reports</NavLink>
            <button onClick={logout} className="ml-auto px-3 py-1 rounded bg-black">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="px-3 py-1 rounded bg-slate-700">Login</NavLink>
            <NavLink to="/register" className="px-3 py-1 rounded bg-black">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
