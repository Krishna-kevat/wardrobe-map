const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders (with optional status filter & ID search)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        // Filter by status
        if (status) {
            if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status filter' });
            }
            query.status = status;
        }

        // Search by Product ID (MongoDB _id of a Product inside the order's products array)
        if (search) {
            // Validate if search string is a valid MongoDB ObjectId
            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                query['products.product_id'] = search;
            } else {
                return res.json({ success: true, count: 0, data: [] }); // Or handle non-ObjectID searches differently if needed
            }
        }

        // Exclude Cancelled orders unless specifically filtering for them
        if (!status) {
            query.status = { $ne: 'Cancelled' };
        }

        const orders = await Order.find(query)
            .populate('user_id', 'full_name email mobile_number')
            .sort({ created_at: -1 })
            .lean();

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private (Admin only)
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user_id', 'full_name email mobile_number')
            .lean();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be Pending, Shipped, Delivered, or Cancelled' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Validate transitions
        const currentStatus = order.status;
        if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') {
            return res.status(400).json({ success: false, message: `Cannot change status once order is ${currentStatus}` });
        }

        if (currentStatus === 'Pending' && !['Shipped', 'Cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: `Pending orders can only be marked as Shipped or Cancelled` });
        }

        if (currentStatus === 'Shipped' && status !== 'Delivered') {
            return res.status(400).json({ success: false, message: `Shipped orders can only be marked as Delivered` });
        }

        // If status changing to Delivered, reduce stock
        if (order.status !== 'Delivered' && status === 'Delivered') {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.product_id, {
                    $inc: { stock: -item.quantity } // Reduce stock by ordered quantity
                });
            }
        }

        // If status changing from Delivered back to something else (e.g., Cancelled or Pending by mistake), increase stock back
        if (order.status === 'Delivered' && status !== 'Delivered') {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.product_id, {
                    $inc: { stock: item.quantity } // Restore stock
                });
            }
        }

        order.status = status;
        await order.save();

        // Re-fetch with populated user if needed, or simply return updated order
        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus
};
