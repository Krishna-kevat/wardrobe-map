const User = require('../models/User');
const Order = require('../models/Order'); // Optional: In case we need it for checking dependencies or later use

// @desc    Get all users, search by name/email, filter by status
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        // Search functionality (name or email)
        if (search) {
            query.$or = [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const users = await User.find(query).sort({ created_at: -1 }).lean();

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Activate or Deactivate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: `User status updated to ${status}`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Reset user password (by admin)
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin only)
const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.resetPasswordRequest) {
            return res.status(403).json({ success: false, message: 'Password reset rejected. The user has not requested a password reset.' });
        }

        // Save new password for actual login, but also store securely temporarily for retrieval
        user.password = password;
        user.tempNewPassword = password;

        user.resetPasswordRequest = false; // Clear the flag
        await user.save();

        // Simulated simulated email dispatch:
        console.log(`[EMAIL SIMULATOR] To: ${user.email} | Subject: Your Wardrobe Map Password Has Been Reset`);
        console.log(`[EMAIL SIMULATOR] Body: Hello ${user.full_name}, an administrator has securely reset your password. You can retrieve your new password by visiting the Retrieve Password page.`);

        res.json({ success: true, message: 'Password updated successfully. The user can retrieve it now using their email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserDetails,
    updateUserStatus,
    resetUserPassword
};
