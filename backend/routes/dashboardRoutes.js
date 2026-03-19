const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Get dashboard statistics (Protected admin route)
router.get('/', protect, getDashboardStats);

module.exports = router;
