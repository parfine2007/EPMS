export default function Header({ title = 'EPMS' }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <h1 className="font-bold text-lg">{title}</h1>
        <p className="text-slate-300 text-sm">Employee Payroll Management System</p>
      </div>
    </header>
  )
}
