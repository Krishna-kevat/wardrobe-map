const Product = require('../models/Product');

// @desc    Get all products (with optional category filter)
// @route   GET /api/admin/products
// @access  Private (Admin only)
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) {
            if (!['Male', 'Female', 'Kids'].includes(category)) {
                return res.status(400).json({ success: false, message: 'Invalid category filter' });
            }
            query.category = category;
        }

        const products = await Product.find(query).sort({ created_at: -1 }).lean();

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
    try {
        const { product_name, title, description, category, price, stock, delivery_charge, sizes } = req.body;

        // Validate enum
        if (category && !['Male', 'Female', 'Kids'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Category must be Male, Female, or Kids' });
        }

        let imagePath = '';
        if (req.file) {
            // Store relative path to DB (e.g., /uploads/filename.jpg)
            imagePath = `/uploads/${req.file.filename}`;
        }

        const product = new Product({
            product_name,
            title,
            description,
            category,
            price: Number(price),
            stock: Number(stock),
            delivery_charge: delivery_charge ? Number(delivery_charge) : 0,
            image: imagePath,
            sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(s => s) : []
        });

        const createdProduct = await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: createdProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        // Handle Mongoose validation errors format
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { product_name, title, description, category, price, stock, delivery_charge, sizes } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Validate category early
        if (category && !['Male', 'Female', 'Kids'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Category must be Male, Female, or Kids' });
        }

        // Prepare fields to update
        product.product_name = product_name || product.product_name;
        product.title = title || product.title;
        product.description = description || product.description;
        product.category = category || product.category;
        if (price !== undefined) product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (delivery_charge !== undefined) product.delivery_charge = Number(delivery_charge);
        if (sizes !== undefined) product.sizes = sizes ? sizes.split(',').map(s => s.trim()).filter(s => s) : [];

        // If new image is uploaded, update it
        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single product details (optional but useful)
// @route   GET /api/admin/products/:id
// @access  Private (Admin only)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
};
