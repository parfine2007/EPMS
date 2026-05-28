require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedDepartments } = require('./controllers/departmentController');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const reportRoutes = require('./routes/reportRoutes');

const AuthMiddleware = require('./middlewares/AuthMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'EPMS Backend Running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', AuthMiddleware, departmentRoutes);
app.use('/api/employees', AuthMiddleware, employeeRoutes);
app.use('/api/salaries', AuthMiddleware, salaryRoutes);
app.use('/api/reports', AuthMiddleware, reportRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const start = async () => {
  await connectDB();
  await seedDepartments();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
