const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Cylinder = require('../models/Cylinder');
const Delivery = require('../models/Delivery');

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardAnalytics = async (req, res) => {
    try {
        // Get date range (default: last 30 days)
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // User statistics
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const newUsers = await User.countDocuments({
            role: 'customer',
            createdAt: { $gte: start, $lte: end }
        });
        const activeUsers = await User.countDocuments({ role: 'customer', isActive: true });

        // Booking statistics
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const deliveredBookings = await Booking.countDocuments({ status: 'delivered' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

        // Revenue statistics
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Cylinder statistics
        const totalCylinders = await Cylinder.countDocuments();
        const activeCylinders = await Cylinder.countDocuments({ status: 'active' });
        const emptyCylinders = await Cylinder.countDocuments({ status: 'empty' });

        // Delivery statistics
        const totalDeliveries = await Delivery.countDocuments();
        const inTransitDeliveries = await Delivery.countDocuments({ status: 'in-transit' });
        const completedDeliveries = await Delivery.countDocuments({ status: 'delivered' });

        // Recent bookings
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email phone');

        // Top customers
        const topCustomers = await Booking.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: '$userId', totalBookings: { $sum: 1 }, totalSpent: { $sum: '$amount' } } },
            { $sort: { totalBookings: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    phone: '$user.phone',
                    totalBookings: 1,
                    totalSpent: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    new: newUsers,
                    active: activeUsers
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                    delivered: deliveredBookings,
                    cancelled: cancelledBookings
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    monthly: monthlyRevenue[0]?.total || 0
                },
                cylinders: {
                    total: totalCylinders,
                    active: activeCylinders,
                    empty: emptyCylinders
                },
                deliveries: {
                    total: totalDeliveries,
                    inTransit: inTransitDeliveries,
                    completed: completedDeliveries
                }
            },
            recentBookings,
            topCustomers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard analytics',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 20, search } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['customer', 'admin', 'delivery'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has active bookings
        const activeBookings = await Booking.countDocuments({
            userId: req.params.id,
            status: { $in: ['pending', 'confirmed', 'processing', 'out-for-delivery'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with active bookings'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.generateReports = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        let report = {};

        switch (type) {
            case 'revenue':
                report = await Payment.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                day: { $dayOfMonth: '$createdAt' }
                            },
                            totalRevenue: { $sum: '$amount' },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;

            case 'bookings':
                report = await Booking.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            totalAmount: { $sum: '$amount' }
                        }
                    }
                ]);
                break;

            case 'cylinders':
                report = await Cylinder.aggregate([
                    {
                        $group: {
                            _id: '$type',
                            count: { $sum: 1 },
                            active: {
                                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                            },
                            empty: {
                                $sum: { $cond: [{ $eq: ['$status', 'empty'] }, 1, 0] }
                            }
                        }
                    }
                ]);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        res.status(200).json({
            success: true,
            type,
            period: { start, end },
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
};
