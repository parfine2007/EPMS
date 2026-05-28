const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  DepartmentCode: { type: String, required: true, unique: true, trim: true },
  DepartmentName: { type: String, required: true, trim: true },
  GrossSalary: { type: Number, required: true, min: 0 },
  TotalDeduction: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
