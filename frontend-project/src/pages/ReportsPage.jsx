import { useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api'

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null)
  const [reportType, setReportType] = useState('')
  const [error, setError] = useState('')

  const monthly = async (e) => {
    e.preventDefault()
    setError('')
    const month = new FormData(e.target).get('month')
    try {
      const data = await api(`/reports/monthly/${encodeURIComponent(month)}`)
      setReportType('monthly')
      setReportData(data)
    } catch (err) {
      setReportData(null)
      setError(err?.error || 'Failed to load monthly report')
    }
  }

  const byDepartment = async (e) => {
    e.preventDefault()
    setError('')
    const form = new FormData(e.target)
    const code = form.get('departmentCode')
    const month = form.get('month')
    const q = month ? `?month=${encodeURIComponent(month)}` : ''
    try {
      const data = await api(`/reports/department/${encodeURIComponent(code)}${q}`)
      setReportType('department')
      setReportData(data)
    } catch (err) {
      setReportData(null)
      setError(err?.error || 'Failed to load department report')
    }
  }

  return (
    <Layout title="Reports">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={monthly} className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-semibold">Monthly Report</h2>
          <input name="month" type="month" className="w-full border rounded px-3 py-2" required />
          <button className="w-full bg-black text-white rounded py-2">View</button>
        </form>
        <form onSubmit={byDepartment} className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-semibold">Department Report</h2>
          <input name="departmentCode" placeholder="CW / ST / MC / ADMS" className="w-full border rounded px-3 py-2" required />
          <input name="month" type="month" className="w-full border rounded px-3 py-2" required />
          <button className="w-full bg-slate-900 text-white rounded py-2">View</button>
        </form>
        {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}

        {reportData ? (
          <div className="md:col-span-2 bg-white rounded shadow p-4 overflow-auto">
            <h3 className="font-semibold mb-3">Report Result</h3>

            {reportType === 'monthly' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-sm">
                <Info label="Month" value={reportData.month} />
                <Info label="Employees Paid" value={reportData.totalEmployeesPaid} />
                <Info label="Total Gross" value={`${Number(reportData?.totals?.totalGross || 0).toLocaleString()} RWF`} />
                <Info label="Total Net" value={`${Number(reportData?.totals?.totalNet || 0).toLocaleString()} RWF`} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-sm">
                <Info label="Department" value={reportData.departmentCode} />
                <Info label="Month" value={reportData.month} />
                <Info label="Records" value={reportData.totalPayrollRecords} />
                <Info label="Total Net Paid" value={`${Number(reportData.totalNetPaid || 0).toLocaleString()} RWF`} />
              </div>
            )}

            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Employee #</th>
                  <th className="px-3 py-2 text-left">Employee Name</th>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-left">Gross</th>
                  <th className="px-3 py-2 text-left">Deduction</th>
                  <th className="px-3 py-2 text-left">Net</th>
                  {reportType === 'department' ? <th className="px-3 py-2 text-left">Payment Check</th> : null}
                </tr>
              </thead>
              <tbody>
                {(reportData.payrolls || []).map((r) => (
                  <tr key={r._id || `${r.EmployeeNumber}-${r.EmployeeName}`} className="border-t">
                    <td className="px-3 py-2">{r.EmployeeNumber}</td>
                    <td className="px-3 py-2">{r.EmployeeName || '-'}</td>
                    <td className="px-3 py-2">{r.Month}</td>
                    <td className="px-3 py-2">{Number(r.GrossSalary).toLocaleString()} RWF</td>
                    <td className="px-3 py-2">{Number(r.TotalDeduction).toLocaleString()} RWF</td>
                    <td className="px-3 py-2">{Number(r.NetSalary).toLocaleString()} RWF</td>
                    {reportType === 'department' ? (
                      <td className="px-3 py-2">
                        {r.paymentStatus || (Number(r.NetSalary) > 0 ? 'Paid' : 'Unpaid')}
                      </td>
                    ) : null}
                  </tr>
                ))}
                {(!reportData.payrolls || reportData.payrolls.length === 0) ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={7}>No records found for this report.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-100 rounded p-3">
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  )
}
