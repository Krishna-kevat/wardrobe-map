const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all active products for the storefront
// @route   GET /api/public/products
// @access  Public
const getPublicProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query).sort({ created_at: -1 }).lean();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch products: ${error.message}` });
    }
};

// @desc    Get single product details
// @route   GET /api/public/products/:id
// @access  Public
const getPublicProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch product: ${error.message}` });
    }
};

// @desc    Process Checkout order
// @route   POST /api/public/checkout
// @access  Public
const processCheckout = async (req, res) => {
    const {
        full_name,
        email,
        mobile_number,
        address,
        city,
        state,
        pincode,
        products, // Array of { product_id, quantity, price }
        payment_method
    } = req.body;

    try {
        // Basic validation
        if (!full_name || !email || !mobile_number || !address || !products || products.length === 0) {
            return res.status(400).json({ message: 'Please provide all required customer logic and at least one product.' });
        }

        // 1. Get user from protected route middleware
        const user = req.user;

        // Unify basic info updates
        const updateFields = {};
        if (mobile_number) updateFields.mobile_number = mobile_number;
        if (address) updateFields.address = address;
        if (city) updateFields.city = city;
        if (state) updateFields.state = state;
        if (pincode) updateFields.pincode = pincode;

        await User.findByIdAndUpdate(user._id, { $set: updateFields });

        // 2. Compute order totals
        let sub_total = 0;
        let total_quantity = 0;
        const processedProducts = [];

        for (const item of products) {
            // Optional: verify product actually exists in DB to prevent price spoofing
            const dbProduct = await Product.findById(item.product_id);
            if (!dbProduct) {
                return res.status(404).json({ message: `Product mapping failed for ID ${item.product_id}` });
            }

            // Verify sufficient stock exists, but DO NOT reduce it yet
            // Wait for Admin to dispatch/Deliver it
            if (dbProduct.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${dbProduct.product_name}. Available: ${dbProduct.stock}` });
            }

            sub_total += (dbProduct.price * item.quantity);
            total_quantity += item.quantity;

            processedProducts.push({
                product_id: dbProduct._id,
                product_name: dbProduct.product_name,
                quantity: item.quantity,
                price: dbProduct.price,
                size: item.size || 'N/A'
            });
        }

        // Hardcode a flat delivery charge or calculate dynamically
        const delivery_charge = 50;
        const grand_total = sub_total + delivery_charge;

        // 3. Create the Order
        const order = await Order.create({
            user_id: user._id,
            products: processedProducts,
            full_name,
            mobile_number,
            address,
            city,
            state,
            pincode,
            total_quantity,
            delivery_charge,
            sub_total: grand_total,
            payment_method: payment_method || 'COD',
            status: 'Pending'
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                order_id: order._id,
                sub_total: grand_total
            }
        });

    } catch (error) {
        return res.status(500).json({ message: `Failed to place order: ${error.message}` });
    }
};

module.exports = {
    getPublicProducts,
    getPublicProductById,
    processCheckout
};
