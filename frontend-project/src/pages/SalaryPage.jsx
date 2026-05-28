import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api'

export default function SalaryPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [salaries, setSalaries] = useState([])
  const [selected, setSelected] = useState('')
  const [grossSalary, setGrossSalary] = useState('')
  const [totalDeduction, setTotalDeduction] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    const [emp, dep, sal] = await Promise.all([
      api('/employees'),
      api('/departments'),
      api('/salaries')
    ])
    setEmployees(emp)
    setDepartments(dep)
    setSalaries(sal)
  }

  useEffect(() => {
    loadData().catch(() => setError('Failed to load salary page data'))
  }, [])

  const selectedEmployee = useMemo(
    () => employees.find((e) => String(e.EmployeeNumber) === String(selected)),
    [employees, selected]
  )
  const selectedDepartment = useMemo(
    () => departments.find((d) => d.DepartmentCode === selectedEmployee?.DepartmentCode),
    [departments, selectedEmployee]
  )
  const parsedGross = Number(grossSalary || 0)
  const parsedDeduction = Number(totalDeduction || 0)
  const netSalary = parsedGross - parsedDeduction
  const invalidNet = parsedDeduction > parsedGross

  useEffect(() => {
    if (selectedDepartment) {
      setGrossSalary(String(selectedDepartment.GrossSalary ?? ''))
      setTotalDeduction(String(selectedDepartment.TotalDeduction ?? ''))
    } else {
      setGrossSalary('')
      setTotalDeduction('')
    }
  }, [selectedDepartment])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const body = Object.fromEntries(new FormData(e.target).entries())
    body.EmployeeNumber = Number(body.EmployeeNumber)
    body.GrossSalary = Number(body.GrossSalary)
    body.TotalDeduction = Number(body.TotalDeduction)

    if (body.TotalDeduction > body.GrossSalary) {
      setError('Total deduction can not be greater than gross salary')
      return
    }

    try {
      await api('/salaries/generate', 'POST', body)
      e.target.reset()
      setSelected('')
      setGrossSalary('')
      setTotalDeduction('')
      await loadData()
    } catch (err) {
      setError(err?.error || 'Salary generation failed')
    }
  }

  return (
    <Layout title="Salary">
      <div className="max-w-6xl mx-auto space-y-4">
        <form onSubmit={submit} className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            name="EmployeeNumber"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e._id} value={e.EmployeeNumber}>
                {e.EmployeeNumber} - {e.FirstName} {e.LastName}, {e.Position}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">Payment Month</label>
            <input name="Month" type="month" className="border rounded px-3 py-2" required />
          </div>

          {selectedEmployee ? (
            <div className="md:col-span-2 text-sm bg-slate-100 rounded p-3">
              <p><strong>Name:</strong> {selectedEmployee.FirstName} {selectedEmployee.LastName}</p>
              <p><strong>Department:</strong> {selectedEmployee.DepartmentCode}</p>
              <p><strong>Position:</strong> {selectedEmployee.Position}</p>
            </div>
          ) : null}
          <input
            value={selectedEmployee?.DepartmentCode || ''}
            readOnly
            placeholder="Department"
            className="border rounded px-3 py-2 bg-slate-100"
          />
          <input
            name="GrossSalary"
            type="number"
            min="0"
            value={grossSalary}
            readOnly
            placeholder="Gross Salary"
            className="border-2 border-slate-700 rounded px-3 py-2 bg-slate-100 font-medium"
          />
          <input
            name="TotalDeduction"
            type="number"
            min="0"
            value={totalDeduction}
            readOnly
            placeholder="Total Reduction"
            className={`border-2 rounded px-3 py-2 font-medium ${invalidNet ? 'border-red-600 bg-red-50' : 'border-slate-700 bg-slate-100'}`}
          />
          <div className={`md:col-span-2 rounded p-3 text-sm border-2 ${invalidNet ? 'border-red-600 bg-red-50' : 'border-slate-700 bg-slate-100'}`}>
            <p><strong>Net Salary:</strong> {netSalary.toLocaleString()} RWF</p>
          </div>

          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
          <button className="md:col-span-2 bg-black text-white rounded py-2">Save Salary</button>
        </form>

        <div className="bg-white rounded shadow p-4 overflow-auto">
          <h3 className="font-semibold mb-3">Generated Report</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-3 py-2">Employee #</th>
                <th className="text-left px-3 py-2">Employee Name</th>
                <th className="text-left px-3 py-2">Payment Month</th>
                <th className="text-left px-3 py-2">Gross Salary</th>
                <th className="text-left px-3 py-2">Total Reduction</th>
                <th className="text-left px-3 py-2">Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-3 py-2">{s.EmployeeNumber}</td>
                  <td className="px-3 py-2">{s.EmployeeName || '-'}</td>
                  <td className="px-3 py-2">{s.Month}</td>
                  <td className="px-3 py-2">{Number(s.GrossSalary).toLocaleString()} RWF</td>
                  <td className="px-3 py-2">{Number(s.TotalDeduction).toLocaleString()} RWF</td>
                  <td className="px-3 py-2">{Number(s.NetSalary).toLocaleString()} RWF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
