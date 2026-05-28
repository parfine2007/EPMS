import Header from './Header'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header title="Employee Payroll Management System" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-16">{children}</main>
      <Footer />
    </div>
  )
}
