const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Request a password reset
// @route   POST /api/public/forgot-password
// @access  Public
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Return success anyway to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If an account with that email exists, an admin has been notified' });
        }

        user.resetPasswordRequest = true;
        await user.save();

        res.status(200).json({ success: true, message: 'If an account with that email exists, an admin has been notified to reset your password' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Retrieve newly reset password securely
// @route   POST /api/public/retrieve-password
// @access  Public
const retrieveNewPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your email address' });
        }

        const user = await User.findOne({ email });

        // Strict verification
        if (!user || !user.tempNewPassword) {
            return res.status(400).json({ success: false, message: 'No new password available to retrieve. Either it has not been reset yet or you already retrieved it.' });
        }

        // Capture the password to show the user
        const newPassword = user.tempNewPassword;

        // Immediately revoke the password so it cannot be viewed again
        user.tempNewPassword = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password retrieved successfully. Please log in.',
            newPassword: newPassword
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/public/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { full_name, email, password, mobile_number, address, city, state, pincode } = req.body;

        if (!full_name || !email || !password || !mobile_number) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            if (userExists.status === 'Inactive') {
                return res.status(400).json({ message: 'Your account has been deactivated. Please contact support.' });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            full_name,
            email,
            password,
            mobile_number,
            address,
            city,
            state,
            pincode
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    full_name: user.full_name,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user or admin
// @route   POST /api/public/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // To improve performance, query both collections concurrently
        const [admin, user] = await Promise.all([
            Admin.findOne({ email }),
            User.findOne({ email }).select('+password')
        ]);

        if (admin) {
            if (await admin.matchPassword(password)) {
                return res.json({
                    success: true,
                    data: {
                        _id: admin._id,
                        email: admin.email,
                        role: admin.role || 'admin',
                        token: generateToken(admin._id)
                    }
                });
            }
            // If admin found but password mismatch, we can optionally just return error immediately 
            // but we'll fall through in case they also have a user account.
        }

        if (user) {
            if (user.status === 'Inactive') {
                return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
            }

            if (await user.matchPassword(password)) {
                return res.json({
                    success: true,
                    data: {
                        _id: user._id,
                        full_name: user.full_name,
                        email: user.email,
                        role: 'user',
                        token: generateToken(user._id)
                    }
                });
            }
        }

        // If neither matched with correct password
        return res.status(401).json({ success: false, message: 'Invalid credentials' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/user/orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user._id }).sort({ created_at: -1 }).lean();

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel an order (only if Pending)
// @route   PUT /api/public/my-orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId, user_id: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or you do not have permission to cancel it' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Order cannot be cancelled because it is already ${order.status}` });
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/public/wishlist/:id
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();

            // Increment wishlist_count for the product
            await Product.findByIdAndUpdate(productId, { $inc: { wishlist_count: 1 } });
        }

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/public/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
        await user.save();

        // Decrement wishlist_count for the product
        await Product.findByIdAndUpdate(productId, { $inc: { wishlist_count: -1 } });

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/public/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMyOrders,
    cancelOrder,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    requestPasswordReset,
    retrieveNewPassword
};
