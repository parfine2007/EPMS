const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

const getMonthlyReport = async (req, res, next) => {
  try {
    const month = req.params.month;
    const rows = await Salary.aggregate([
      { $match: { Month: month } },
      { $sort: { EmployeeNumber: 1 } },
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
          Month: 1,
          GrossSalary: 1,
          TotalDeduction: 1,
          NetSalary: 1,
          DepartmentCode: '$employee.DepartmentCode',
          Position: '$employee.Position',
          Telephone: '$employee.Telephone',
          HiredDate: '$employee.HiredDate',
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
          }
        }
      }
    ]);

    const totalGross = rows.reduce((sum, item) => sum + item.GrossSalary, 0);
    const totalDeduction = rows.reduce((sum, item) => sum + item.TotalDeduction, 0);
    const totalNet = rows.reduce((sum, item) => sum + item.NetSalary, 0);

    res.status(200).json({
      month,
      totalEmployeesPaid: rows.length,
      totals: { totalGross, totalDeduction, totalNet },
      payrolls: rows
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentReport = async (req, res, next) => {
  try {
    const month = req.query.month;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month query is required in YYYY-MM format' });
    }

    const employees = await Employee.find({ DepartmentCode: req.params.departmentCode })
      .sort({ EmployeeNumber: 1 })
      .lean();
    const numbers = employees.map((e) => e.EmployeeNumber);
    const salaries = await Salary.find({ EmployeeNumber: { $in: numbers }, Month: month }).lean();
    const salaryByNumber = new Map(salaries.map((s) => [String(s.EmployeeNumber), s]));

    const rowsWithStatus = employees.map((e) => {
      const s = salaryByNumber.get(String(e.EmployeeNumber));
      return {
        EmployeeNumber: e.EmployeeNumber,
        EmployeeName: `${e.FirstName || ''} ${e.LastName || ''}`.trim(),
        Month: month,
        GrossSalary: s ? s.GrossSalary : 0,
        TotalDeduction: s ? s.TotalDeduction : 0,
        NetSalary: s ? s.NetSalary : 0,
        paymentStatus: s ? 'Paid' : 'Unpaid'
      };
    });
    const totalNet = rowsWithStatus.reduce((sum, item) => sum + item.NetSalary, 0);

    res.status(200).json({
      departmentCode: req.params.departmentCode,
      month,
      totalPayrollRecords: rowsWithStatus.length,
      totalNetPaid: totalNet,
      payrolls: rowsWithStatus
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatusReport = async (req, res, next) => {
  try {
    const month = req.query.month || req.params.month;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month query is required in YYYY-MM format' });
    }

    const employees = await Employee.find().sort({ EmployeeNumber: 1 });
    const empNumbers = employees.map((e) => e.EmployeeNumber);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const debtCutoffMonth = month < currentMonth ? month : currentMonth;

    const salaries = await Salary.find({
      EmployeeNumber: { $in: empNumbers },
      Month: { $lte: debtCutoffMonth }
    }).select('EmployeeNumber Month');

    const paidByEmployee = new Map();
    for (const s of salaries) {
      const key = String(s.EmployeeNumber);
      if (!paidByEmployee.has(key)) paidByEmployee.set(key, new Set());
      paidByEmployee.get(key).add(s.Month);
    }

    const buildMonthList = (start, end) => {
      const out = [];
      if (start > end) return out;
      let [y, m] = start.split('-').map(Number);
      const [ey, em] = end.split('-').map(Number);
      while (y < ey || (y === ey && m <= em)) {
        out.push(`${y}-${String(m).padStart(2, '0')}`);
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
      return out;
    };

    const rows = employees.map((e) => {
      const hiredMonth = String(e.HiredDate).slice(0, 7);
      const paidSet = paidByEmployee.get(String(e.EmployeeNumber)) || new Set();
      const paidForMonth = month >= hiredMonth && paidSet.has(month);
      const expectedMonths = buildMonthList(hiredMonth, debtCutoffMonth);
      const unpaidMonths = expectedMonths.filter((m) => !paidSet.has(m));
      return {
        EmployeeNumber: e.EmployeeNumber,
        EmployeeName: `${e.FirstName} ${e.LastName}`,
        DepartmentCode: e.DepartmentCode,
        Position: e.Position,
        HiredDate: e.HiredDate,
        paidForMonth,
        debtMonthsCount: unpaidMonths.length,
        unpaidMonths
      };
    });

    const paidCount = rows.filter((r) => r.paidForMonth).length;
    const unpaidCount = rows.length - paidCount;

    res.status(200).json({
      month,
      summary: {
        totalEmployees: rows.length,
        paidCount,
        unpaidCount
      },
      rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMonthlyReport, getDepartmentReport, getPaymentStatusReport };
