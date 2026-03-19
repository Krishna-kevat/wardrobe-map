const express = require('express');
const router = express.Router();
const {
    getPublicProducts,
    getPublicProductById,
    processCheckout
} = require('../controllers/publicController');

const {
    registerUser,
    loginUser,
    getMyOrders,
    cancelOrder,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    requestPasswordReset,
    retrieveNewPassword
} = require('../controllers/userAuthController');

const { protectUser } = require('../middleware/authMiddleware');

// Define Public Routes
router.route('/products').get(getPublicProducts);
router.route('/products/:id').get(getPublicProductById);

// Public Auth Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(requestPasswordReset);
router.route('/retrieve-password').post(retrieveNewPassword);

// Protected User Routes
router.route('/checkout').post(protectUser, processCheckout);
router.route('/my-orders').get(protectUser, getMyOrders);
router.route('/my-orders/:id/cancel').put(protectUser, cancelOrder);
router.route('/wishlist').get(protectUser, getWishlist);
router.route('/wishlist/:id').post(protectUser, addToWishlist).delete(protectUser, removeFromWishlist);

module.exports = router;
