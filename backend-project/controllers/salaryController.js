const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

const generatePayroll = async (req, res) => {
  try {
    const { EmployeeNumber, Month, GrossSalary, TotalDeduction } = req.body;

    if (!EmployeeNumber || !Month || GrossSalary === undefined || TotalDeduction === undefined) {
      return res.status(400).json({ error: 'EmployeeNumber, Month, GrossSalary and TotalDeduction are required' });
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(Month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (Month !== currentMonth) {
      return res.status(400).json({ error: `Payment is only allowed for current month: ${currentMonth}` });
    }

    const employee = await Employee.findOne({ EmployeeNumber });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const hiredMonth = String(employee.HiredDate).slice(0, 7);
    if (Month < hiredMonth) {
      return res.status(400).json({ error: `Payment cannot be before hired month (${hiredMonth})` });
    }

    const alreadyPaid = await Salary.findOne({ EmployeeId: employee._id, Month });
    if (alreadyPaid) {
      return res.status(400).json({ error: `Salary has already been given for ${Month}.` });
    }

    const grossSalary = Number(GrossSalary);
    const totalDeduction = Number(TotalDeduction);
    if (Number.isNaN(grossSalary) || grossSalary < 0) {
      return res.status(400).json({ error: 'Invalid gross salary' });
    }
    if (Number.isNaN(totalDeduction) || totalDeduction < 0) {
      return res.status(400).json({ error: 'Invalid total deduction' });
    }
    if (totalDeduction > grossSalary) {
      return res.status(400).json({ error: 'Total deduction can not be greater than gross salary' });
    }

    const netSalary = grossSalary - totalDeduction;
    if (netSalary < 0) {
      return res.status(400).json({ error: 'Net salary can not be negative' });
    }

    const salary = await Salary.create({
      EmployeeId: employee._id,
      EmployeeNumber,
      GrossSalary: grossSalary,
      TotalDeduction: totalDeduction,
      NetSalary: netSalary,
      Month
    });

    res.status(201).json({ message: 'Payroll generated successfully', salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSalaries = async (req, res) => {
  try {
    const data = await Salary.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'employees',
          localField: 'EmployeeId',
          foreignField: '_id',
          as: 'employeeById'
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { salaryEmpNo: '$EmployeeNumber' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: '$EmployeeNumber' },
                    { $toString: '$$salaryEmpNo' }
                  ]
                }
              }
            }
          ],
          as: 'employeeByNumber'
        }
      },
      {
        $addFields: {
          employee: {
            $ifNull: [
              { $arrayElemAt: ['$employeeById', 0] },
              { $arrayElemAt: ['$employeeByNumber', 0] }
            ]
          }
        }
      },
      {
        $project: {
          EmployeeNumber: 1,
          GrossSalary: 1,
          TotalDeduction: 1,
          NetSalary: 1,
          Month: 1,
          createdAt: 1,
          EmployeeName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$employee.FirstName', ''] },
                  ' ',
                  { $ifNull: ['$employee.LastName', ''] }
                ]
              }
            }
          },
          Position: '$employee.Position',
          DepartmentCode: '$employee.DepartmentCode'
        }
      }
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generatePayroll, getSalaries };
