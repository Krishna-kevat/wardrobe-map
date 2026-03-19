const express = require('express');
const router = express.Router();
// loginAdmin is no longer used, unified in publicRoutes
const { protect } = require('../middleware/authMiddleware');

// Public route for login handled by publicRoutes.js

// Example of protected route (can be used to test token verification)
router.get('/profile', protect, (req, res) => {
    res.status(200).json({ message: 'Admin profile data', admin: req.admin });
});

module.exports = router;
