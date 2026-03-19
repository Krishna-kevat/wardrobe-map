const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Male', 'Female', 'Kids']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative']
    },
    image: {
        type: String,
        default: ''
    },
    sizes: {
        type: [String],
        default: []
    },
    delivery_charge: {
        type: Number,
        default: 0,
        min: [0, 'Delivery charge cannot be negative']
    },
    wishlist_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

productSchema.index({ category: 1, created_at: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
