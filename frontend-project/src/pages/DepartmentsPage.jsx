import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    api('/departments').then(setDepartments).catch(() => setDepartments([]))
  }, [])

  return (
    <Layout title="Department">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Gross Salary</th>
              <th className="px-3 py-2 text-left">Total Deduction</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="px-3 py-2">{d.DepartmentCode}</td>
                <td className="px-3 py-2">{d.DepartmentName}</td>
                <td className="px-3 py-2">{Number(d.GrossSalary).toLocaleString()} RWF</td>
                <td className="px-3 py-2">{Number(d.TotalDeduction).toLocaleString()} RWF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
