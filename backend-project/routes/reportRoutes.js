const express = require('express');
const { getMonthlyReport, getDepartmentReport, getPaymentStatusReport } = require('../controllers/reportController');

const router = express.Router();
router.get('/monthly/:month', getMonthlyReport);
router.get('/department/:departmentCode', getDepartmentReport);
router.get('/status', getPaymentStatusReport);
router.get('/status/:month', getPaymentStatusReport);

module.exports = router;
