const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  EmployeeNumber: { type: Number, required: true },
  GrossSalary: { type: Number, required: true, min: 0 },
  TotalDeduction: { type: Number, required: true, min: 0 },
  NetSalary: { type: Number, required: true, min: 0 },
  Month: { type: String, required: true, trim: true }
}, { timestamps: true });

salarySchema.index({ EmployeeId: 1, Month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
