const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUsers,
    getUserDetails,
    updateUserStatus,
    resetUserPassword
} = require('../controllers/userController');

// All routes are protected and for admin only
router.route('/')
    .get(protect, getUsers);

router.route('/:id')
    .get(protect, getUserDetails);

router.route('/:id/reset-password')
    .put(protect, resetUserPassword);

router.route('/:id/status')
    .put(protect, updateUserStatus);

module.exports = router;
