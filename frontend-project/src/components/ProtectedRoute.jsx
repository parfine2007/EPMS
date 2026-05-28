import { Navigate } from 'react-router-dom'
import { token } from '../api'

export default function ProtectedRoute({ children }) {
  if (!token.get()) return <Navigate to="/login" replace />
  return children
}
