const Employee = require('../models/Employee');
const Department = require('../models/Department');

const createEmployee = async (req, res) => {
  try {
    const { FirstName, LastName, Position, Address, Telephone, Gender, HiredDate, DepartmentCode } = req.body;
    const nameRegex = /^[A-Za-z]{3,}$/;

    if (!FirstName || !LastName || !Position || !Address || !Telephone || !Gender || !HiredDate || !DepartmentCode) {
      return res.status(400).json({ error: 'All employee fields are required' });
    }

    const cleanFirstName = String(FirstName).trim();
    const cleanLastName = String(LastName).trim();
    const cleanPosition = String(Position).trim();

    if (!nameRegex.test(cleanFirstName)) {
      return res.status(400).json({ error: 'First name must be at least 3 letters and contain no spaces or symbols' });
    }
    if (!nameRegex.test(cleanLastName)) {
      return res.status(400).json({ error: 'Last name must be at least 3 letters and contain no spaces or symbols' });
    }
    if (!nameRegex.test(cleanPosition)) {
      return res.status(400).json({ error: 'Position must be at least 3 letters and contain no spaces or symbols' });
    }

    const existingByName = await Employee.findOne({
      FirstName: new RegExp(`^${cleanFirstName}$`, 'i'),
      LastName: new RegExp(`^${cleanLastName}$`, 'i')
    });
    if (existingByName) {
      return res.status(400).json({ error: 'Employee with same name already exists' });
    }
    const existingFirstName = await Employee.findOne({
      FirstName: new RegExp(`^${cleanFirstName}$`, 'i')
    });
    if (existingFirstName) {
      return res.status(400).json({ error: 'First name already exists' });
    }

    const phone = String(Telephone).trim();
    if (!/^(072|073|078|079)\d{7}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid telephone number' });
    }

    const department = await Department.findOne({ DepartmentCode });
    if (!department) return res.status(404).json({ error: 'Department not found' });

    const hiredDate = new Date(HiredDate);
    if (Number.isNaN(hiredDate.getTime())) {
      return res.status(400).json({ error: 'Invalid hired date' });
    }
    const now = new Date();
    const sameYear = hiredDate.getUTCFullYear() === now.getUTCFullYear();
    const sameMonth = hiredDate.getUTCMonth() === now.getUTCMonth();
    if (!sameYear || !sameMonth) {
      return res.status(400).json({ error: 'Hired date must be in the current month and year only' });
    }

    const lastEmployee = await Employee.findOne().sort({ EmployeeNumber: -1 });
    const nextNumber = lastEmployee ? lastEmployee.EmployeeNumber + 1 : 1;

    const employee = await Employee.create({
      EmployeeNumber: nextNumber,
      FirstName: cleanFirstName,
      LastName: cleanLastName,
      Position: cleanPosition,
      Address: Address.trim(),
      Telephone: phone,
      Gender: Gender.trim(),
      HiredDate: HiredDate.trim(),
      DepartmentCode
    });

    res.status(201).json({ message: 'Employee saved', employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const data = await Employee.find().sort({ EmployeeNumber: 1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Employee.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json({ message: 'Employee removed from system' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, Position, Address, Telephone, Gender, HiredDate, DepartmentCode } = req.body;
    const nameRegex = /^[A-Za-z]{3,}$/;

    if (!FirstName || !LastName || !Position || !Address || !Telephone || !Gender || !HiredDate || !DepartmentCode) {
      return res.status(400).json({ error: 'All employee fields are required' });
    }

    const cleanFirstName = String(FirstName).trim();
    const cleanLastName = String(LastName).trim();
    const cleanPosition = String(Position).trim();
    if (!nameRegex.test(cleanFirstName) || !nameRegex.test(cleanLastName) || !nameRegex.test(cleanPosition)) {
      return res.status(400).json({ error: 'First name, last name and position must be at least 3 letters with no spaces or symbols' });
    }

    const phone = String(Telephone).trim();
    if (!/^(072|073|078|079)\d{7}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid telephone number' });
    }

    const department = await Department.findOne({ DepartmentCode });
    if (!department) return res.status(404).json({ error: 'Department not found' });

    const hiredDate = new Date(HiredDate);
    if (Number.isNaN(hiredDate.getTime())) {
      return res.status(400).json({ error: 'Invalid hired date' });
    }
    const now = new Date();
    if (hiredDate.getUTCFullYear() !== now.getUTCFullYear() || hiredDate.getUTCMonth() !== now.getUTCMonth()) {
      return res.status(400).json({ error: 'Hired date must be in the current month and year only' });
    }

    const duplicateFirst = await Employee.findOne({
      _id: { $ne: id },
      FirstName: new RegExp(`^${cleanFirstName}$`, 'i')
    });
    if (duplicateFirst) return res.status(400).json({ error: 'First name already exists' });

    const updated = await Employee.findByIdAndUpdate(
      id,
      {
        FirstName: cleanFirstName,
        LastName: cleanLastName,
        Position: cleanPosition,
        Address: String(Address).trim(),
        Telephone: phone,
        Gender: String(Gender).trim(),
        HiredDate: String(HiredDate).trim(),
        DepartmentCode
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated', employee: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createEmployee, getEmployees, updateEmployee, deleteEmployee };
