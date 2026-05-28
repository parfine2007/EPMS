const Department = require('../models/Department');
const Employee = require('../models/Employee');

const seedDepartments = async () => {
  const departments = [
    { DepartmentCode: 'CW', DepartmentName: 'Carwash', GrossSalary: 300000, TotalDeduction: 20000 },
    { DepartmentCode: 'ST', DepartmentName: 'Stock', GrossSalary: 200000, TotalDeduction: 5000 },
    { DepartmentCode: 'MC', DepartmentName: 'Mechanic', GrossSalary: 450000, TotalDeduction: 40000 },
    { DepartmentCode: 'ADMS', DepartmentName: 'Administration Staff', GrossSalary: 600000, TotalDeduction: 70000 }
  ];

  for (const dep of departments) {
    await Department.updateOne({ DepartmentCode: dep.DepartmentCode }, dep, { upsert: true });
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const data = await Department.find().sort({ DepartmentCode: 1 }).lean();
    const counts = await Employee.aggregate([
      { $group: { _id: '$DepartmentCode', totalEmployees: { $sum: 1 } } }
    ]);
    const map = new Map(counts.map((c) => [c._id, c.totalEmployees]));
    const withCounts = data.map((d) => ({
      ...d,
      totalEmployees: map.get(d.DepartmentCode) || 0
    }));
    res.status(200).json(withCounts);
  } catch (error) {
    next(error);
  }
};

module.exports = { seedDepartments, getDepartments };
