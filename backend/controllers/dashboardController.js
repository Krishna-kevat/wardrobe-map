const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            revenueAggregation,
            recentOrders,
            monthlyOrders
        ] = await Promise.all([
            User.countDocuments({}),
            Product.countDocuments({}),
            Order.countDocuments({}),
            Order.aggregate([
                { $match: { status: 'Delivered' } },
                { $group: { _id: null, totalRevenue: { $sum: '$sub_total' } } }
            ]),
            Order.find({})
                .sort({ created_at: -1 })
                .limit(5)
                .populate('user_id', 'full_name email')
                .lean(),
            Order.aggregate([
                {
                    $match: {
                        created_at: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$created_at' },
                        count: { $sum: 1 },
                        revenue: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'Delivered'] }, '$sub_total', 0]
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // Construct structured JSON response
        res.json({
            success: true,
            data: {
                totals: {
                    users: totalUsers,
                    products: totalProducts,
                    orders: totalOrders,
                    revenue: totalRevenue
                },
                recentOrders,
                monthlyStats: monthlyOrders.map(stat => ({
                    month: stat._id,
                    orderCount: stat.count,
                    monthRevenue: stat.revenue
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
