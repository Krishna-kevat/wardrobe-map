const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            product_name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            size: { type: String, required: true }
        }
    ],
    full_name: {
        type: String,
        required: [true, 'Full name is required']
    },
    mobile_number: {
        type: String,
        required: [true, 'Mobile number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required']
    },
    total_quantity: {
        type: Number,
        required: [true, 'Total quantity is required']
    },
    delivery_charge: {
        type: Number,
        default: 0
    },
    sub_total: {
        type: Number,
        required: [true, 'Sub total is required'],
        default: 0.0
    },
    payment_method: {
        type: String,
        enum: ['COD'],
        default: 'COD'
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

orderSchema.index({ user_id: 1, status: 1 });
orderSchema.index({ created_at: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
