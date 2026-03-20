const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
    createDefaultAdmin();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.send("API Running 🚀");
});
// Serve static directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Automatically create custom default admin
const createDefaultAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'jdk123@gmail.com' });
        if (!adminExists) {
            await Admin.create({
                email: 'jdk123@gmail.com',
                password: '#jdk123#',
                role: 'admin'
            });
            console.log('Default admin created successfully.');
        } else {
            console.log('Default admin already exists.');
        }
    } catch (error) {
        console.error(`Error creating default admin: ${error.message}`);
    }
};

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);

app.use('/api/public', publicRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
