import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api'

export default function EmployeesPage() {
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState({})

  const loadPageData = async () => {
    const [dep, emp] = await Promise.all([
      api('/departments'),
      api('/employees')
    ])
    setDepartments(dep)
    setEmployees(emp)
  }

  useEffect(() => {
    loadPageData().catch(() => setError('Failed to load employee page data'))
  }, [])

  const selectedDepartment = departments.find((d) => d.DepartmentCode === selectedDepartmentCode)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const form = new FormData(e.target)
    const body = Object.fromEntries(form.entries())
    const nameRegex = /^[A-Za-z]{3,}$/

    if (!nameRegex.test(String(body.FirstName || '').trim())) {
      setError('First name must be at least 3 letters and contain no spaces or symbols')
      return
    }
    if (!nameRegex.test(String(body.LastName || '').trim())) {
      setError('Last name must be at least 3 letters and contain no spaces or symbols')
      return
    }
    if (!nameRegex.test(String(body.Position || '').trim())) {
      setError('Position must be at least 3 letters and contain no spaces or symbols')
      return
    }

    if (!/^(072|073|078|079)\d{7}$/.test(String(body.Telephone || ''))) {
      setError('Invalid telephone number')
      return
    }
    const hired = new Date(body.HiredDate)
    const now = new Date()
    const sameYear = hired.getUTCFullYear() === now.getUTCFullYear()
    const sameMonth = hired.getUTCMonth() === now.getUTCMonth()
    if (!sameYear || !sameMonth) {
      setError('Hired date must be in the current month and year only')
      return
    }

    try {
      await api('/employees', 'POST', body)
      e.target.reset()
      setSelectedDepartmentCode('')
      await loadPageData()
    } catch (err) {
      setError(err?.error || 'Failed to save employee')
    }
  }

  const startEdit = (emp) => {
    setError('')
    setEditingId(emp._id)
    setEditForm({
      FirstName: emp.FirstName || '',
      LastName: emp.LastName || '',
      Position: emp.Position || '',
      Address: emp.Address || '',
      Telephone: emp.Telephone || '',
      Gender: emp.Gender || 'Male',
      HiredDate: emp.HiredDate || '',
      DepartmentCode: emp.DepartmentCode || ''
    })
  }

  const saveEdit = async () => {
    try {
      await api(`/employees/${editingId}`, 'PUT', editForm)
      setEditingId('')
      setEditForm({})
      await loadPageData()
    } catch (err) {
      setError(err?.error || 'Failed to update employee')
    }
  }

  const removeEmployee = async (id) => {
    try {
      await api(`/employees/${id}`, 'DELETE')
      if (editingId === id) {
        setEditingId('')
        setEditForm({})
      }
      await loadPageData()
    } catch (err) {
      setError(err?.error || 'Failed to delete employee')
    }
  }

  return (
    <Layout title="Employees">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">Employee Registration</h2>
            <p className="text-slate-300 text-sm mt-1">Fill in employee information and save to the system.</p>
          </div>

          <form onSubmit={submit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="FirstName" minLength={3} pattern="[A-Za-z]{3,}" title="At least 3 letters, no spaces or symbols" placeholder="First Name" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500" required />
            <input name="LastName" minLength={3} pattern="[A-Za-z]{3,}" title="At least 3 letters, no spaces or symbols" placeholder="Last Name" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500" required />
            <input name="Position" minLength={3} pattern="[A-Za-z]{3,}" title="At least 3 letters, no spaces or symbols" placeholder="Position" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500" required />
            <input name="Telephone" placeholder="Telephone (072/073/078/079...)" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500" required />
            <input name="HiredDate" type="date" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500" required />
            <select
              name="DepartmentCode"
              value={selectedDepartmentCode}
              onChange={(e) => setSelectedDepartmentCode(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
              required
            >
              <option value="">Department</option>
              {departments.map((d) => <option key={d._id} value={d.DepartmentCode}>{d.DepartmentCode}</option>)}
            </select>
            {selectedDepartment ? (
              <div className="md:col-span-2 text-sm bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
                Total employees in {selectedDepartment.DepartmentCode}: <strong>{selectedDepartment.totalEmployees || 0}</strong>
              </div>
            ) : null}

            <input name="Address" placeholder="Address" className="border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 md:col-span-2" required />

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700 mb-2">Gender</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-slate-800"><input type="radio" name="Gender" value="Male" required /> Male</label>
                <label className="flex items-center gap-2 text-slate-800"><input type="radio" name="Gender" value="Female" required /> Female</label>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

            <button className="md:col-span-2 bg-slate-900 hover:bg-black text-white rounded-lg py-3 font-semibold transition-colors">
              Save Employee
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-6">
          <div className="bg-slate-900 text-white px-6 py-4">
            <h3 className="text-xl font-semibold">Registered Employees</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Telephone</th>
                  <th className="px-3 py-2 text-left">Hired Date</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id} className="border-t">
                    <td className="px-3 py-2">{e.EmployeeNumber}</td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <div className="flex gap-2">
                          <input className="border rounded px-2 py-1 w-28" value={editForm.FirstName || ''} onChange={(ev) => setEditForm((p) => ({ ...p, FirstName: ev.target.value }))} />
                          <input className="border rounded px-2 py-1 w-28" value={editForm.LastName || ''} onChange={(ev) => setEditForm((p) => ({ ...p, LastName: ev.target.value }))} />
                        </div>
                      ) : `${e.FirstName} ${e.LastName}`}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <input className="border rounded px-2 py-1 w-28" value={editForm.Position || ''} onChange={(ev) => setEditForm((p) => ({ ...p, Position: ev.target.value }))} />
                      ) : e.Position}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <select className="border rounded px-2 py-1 w-28" value={editForm.DepartmentCode || ''} onChange={(ev) => setEditForm((p) => ({ ...p, DepartmentCode: ev.target.value }))}>
                          <option value="">Department</option>
                          {departments.map((d) => <option key={d._id} value={d.DepartmentCode}>{d.DepartmentCode}</option>)}
                        </select>
                      ) : e.DepartmentCode}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <input className="border rounded px-2 py-1 w-32" value={editForm.Telephone || ''} onChange={(ev) => setEditForm((p) => ({ ...p, Telephone: ev.target.value }))} />
                      ) : e.Telephone}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <input type="date" className="border rounded px-2 py-1" value={editForm.HiredDate || ''} onChange={(ev) => setEditForm((p) => ({ ...p, HiredDate: ev.target.value }))} />
                      ) : e.HiredDate}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === e._id ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={saveEdit} className="bg-slate-800 text-white rounded px-2 py-1">Save</button>
                          <button type="button" onClick={() => { setEditingId(''); setEditForm({}) }} className="bg-slate-300 rounded px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(e)} className="bg-slate-800 text-white rounded px-2 py-1">Edit</button>
                          <button type="button" onClick={() => removeEmployee(e._id)} className="bg-red-600 text-white rounded px-2 py-1">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={7}>No employees registered yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
