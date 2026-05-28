const express = require('express');
const { generatePayroll, getSalaries } = require('../controllers/salaryController');

const router = express.Router();
router.post('/generate', generatePayroll);
router.get('/', getSalaries);

module.exports = router;
