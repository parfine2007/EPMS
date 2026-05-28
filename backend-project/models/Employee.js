const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeNumber: { type: Number, required: true, unique: true },
  FirstName: { type: String, required: true, trim: true },
  LastName: { type: String, required: true, trim: true },
  Position: { type: String, required: true, trim: true },
  Address: { type: String, required: true, trim: true },
  Telephone: { type: String, required: true, trim: true },
  Gender: { type: String, required: true, trim: true },
  HiredDate: { type: String, required: true, trim: true },
  DepartmentCode: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
