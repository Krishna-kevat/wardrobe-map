const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');

// All routes are protected and for admin only
router.route('/')
    .get(protect, getOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

module.exports = router;
