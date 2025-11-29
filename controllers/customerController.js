const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Cylinder = require('../models/Cylinder');
const Delivery = require('../models/Delivery');

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private
exports.getCustomerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        // Get statistics
        const totalBookings = await Booking.countDocuments({ userId: req.user.id });
        const completedBookings = await Booking.countDocuments({ userId: req.user.id, status: 'delivered' });
        const totalSpent = await Payment.aggregate([
            { $match: { userId: req.user._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const activeCylinders = await Cylinder.countDocuments({ userId: req.user.id, status: 'active' });

        res.status(200).json({
            success: true,
            profile: {
                user,
                statistics: {
                    totalBookings,
                    completedBookings,
                    totalSpent: totalSpent[0]?.total || 0,
                    activeCylinders
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Get customer booking history
// @route   GET /api/customers/history
// @access  Private
exports.getCustomerHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, year, month } = req.query;

        const query = { userId: req.user.id };

        // Filter by year and month if provided
        if (year || month) {
            const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1);
            const endDate = new Date(year || new Date().getFullYear(), month ? month : 12, 0);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const skip = (page - 1) * limit;

        // Get bookings with related data
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Booking.countDocuments(query);

        // Get payments for these bookings
        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ bookingId: { $in: bookingIds } });
        const deliveries = await Delivery.find({ bookingId: { $in: bookingIds } });

        // Combine data
        const history = bookings.map(booking => {
            const payment = payments.find(p => p.bookingId.toString() === booking._id.toString());
            const delivery = deliveries.find(d => d.bookingId.toString() === booking._id.toString());

            return {
                booking,
                payment,
                delivery: delivery ? {
                    status: delivery.status,
                    deliveryDate: delivery.deliveredAt,
                    rating: delivery.rating
                } : null
            };
        });

        res.status(200).json({
            success: true,
            count: history.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching history',
            error: error.message
        });
    }
};

// @desc    Get customer analytics
// @route   GET /api/customers/analytics
// @access  Private
exports.getCustomerAnalytics = async (req, res) => {
    try {
        // Monthly spending
        const monthlySpending = await Payment.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    status: 'completed',
                    createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        // Cylinder type preferences
        const cylinderPreferences = await Booking.aggregate([
            { $match: { userId: req.user._id, status: 'delivered' } },
            {
                $group: {
                    _id: '$cylinderType',
                    count: { $sum: '$quantity' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Average delivery rating
        const deliveryRatings = await Delivery.aggregate([
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
            { $match: { 'booking.userId': req.user._id, rating: { $exists: true } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        // Refill frequency (days between bookings)
        const bookings = await Booking.find({ userId: req.user.id, status: 'delivered' })
            .sort({ createdAt: 1 })
            .select('createdAt');

        let avgDaysBetweenBookings = 0;
        if (bookings.length > 1) {
            const intervals = [];
            for (let i = 1; i < bookings.length; i++) {
                const days = Math.floor((bookings[i].createdAt - bookings[i - 1].createdAt) / (1000 * 60 * 60 * 24));
                intervals.push(days);
            }
            avgDaysBetweenBookings = Math.floor(intervals.reduce((a, b) => a + b, 0) / intervals.length);
        }

        res.status(200).json({
            success: true,
            analytics: {
                monthlySpending,
                cylinderPreferences,
                deliveryRatings: deliveryRatings[0] || { avgRating: 0, totalRatings: 0 },
                refillFrequency: {
                    avgDaysBetweenBookings,
                    totalBookings: bookings.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// @desc    Get loyalty points (placeholder for future implementation)
// @route   GET /api/customers/loyalty
// @access  Private
exports.getLoyaltyPoints = async (req, res) => {
    try {
        // Calculate points based on completed bookings
        const completedBookings = await Booking.countDocuments({
            userId: req.user.id,
            status: 'delivered'
        });

        const totalSpent = await Payment.aggregate([
            { $match: { userId: req.user._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Simple points calculation: 1 point per booking + 1 point per ₹100 spent
        const bookingPoints = completedBookings * 10;
        const spendingPoints = Math.floor((totalSpent[0]?.total || 0) / 100);
        const totalPoints = bookingPoints + spendingPoints;

        // Determine tier
        let tier = 'Bronze';
        if (totalPoints >= 1000) tier = 'Platinum';
        else if (totalPoints >= 500) tier = 'Gold';
        else if (totalPoints >= 200) tier = 'Silver';

        res.status(200).json({
            success: true,
            loyalty: {
                points: totalPoints,
                tier,
                breakdown: {
                    bookingPoints,
                    spendingPoints
                },
                benefits: {
                    Bronze: 'Standard service',
                    Silver: '5% discount on bookings',
                    Gold: '10% discount + Priority delivery',
                    Platinum: '15% discount + Priority delivery + Free delivery'
                }[tier]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching loyalty points',
            error: error.message
        });
    }
};

// @desc    Get customer preferences
// @route   GET /api/customers/preferences
// @access  Private
exports.getCustomerPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('preferences');

        res.status(200).json({
            success: true,
            preferences: user.preferences || {
                emailNotifications: true,
                smsNotifications: true,
                preferredCylinderType: '14.2kg',
                preferredDeliveryTime: 'morning'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching preferences',
            error: error.message
        });
    }
};

// @desc    Update customer preferences
// @route   PUT /api/customers/preferences
// @access  Private
exports.updateCustomerPreferences = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences: req.body },
            { new: true }
        ).select('preferences');

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating preferences',
            error: error.message
        });
    }
};

// @desc    Get all customers (Admin)
// @route   GET /api/customers/admin/all
// @access  Private (Admin)
exports.getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, sortBy = 'createdAt' } = req.query;

        const query = { role: 'customer' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const customers = await User.find(query)
            .select('-password')
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Get statistics for each customer
        const customersWithStats = await Promise.all(customers.map(async (customer) => {
            const totalBookings = await Booking.countDocuments({ userId: customer._id });
            const totalSpent = await Payment.aggregate([
                { $match: { userId: customer._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            return {
                ...customer.toObject(),
                statistics: {
                    totalBookings,
                    totalSpent: totalSpent[0]?.total || 0
                }
            };
        }));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: customersWithStats.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            customers: customersWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};
