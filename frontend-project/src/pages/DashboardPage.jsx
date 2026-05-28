import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function DashboardPage() {
  return (
    <Layout title="EPMS Dashboard">
      <section className="bg-gradient-to-r from-slate-900 to-black text-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-bold">SmartPark Payroll Control Center</h2>
        <p className="text-slate-300 mt-2">
          Manage employee records, process salaries, and generate clear payroll reports in one place.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NavCard
          to="/employees"
          label="Employees"
          description="Register employees, capture personal details, and assign department information."
        />
        <NavCard
          to="/salary"
          label="Salary"
          description="Generate employee salary by payment month using department gross salary and total reduction."
        />
        <NavCard
          to="/departments"
          label="Department"
          description="View available departments with their department code, gross salary, and total reduction."
        />
        <NavCard
          to="/reports"
          label="Reports"
          description="Generate monthly and department reports to track who has been paid and totals."
        />
      </section>
    </Layout>
  )
}

function NavCard({ to, label, description }) {
  return (
    <Link to={to} className="bg-white p-6 rounded-2xl shadow hover:shadow-md hover:-translate-y-0.5 transition border border-slate-200">
      <h3 className="font-semibold text-slate-900 text-lg">{label}</h3>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
      <p className="text-xs text-slate-400 mt-4">Open module</p>
    </Link>
  )
}
