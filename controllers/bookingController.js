const Booking = require('../models/Booking');
const Cylinder = require('../models/Cylinder');
const Delivery = require('../models/Delivery');
const { sendNotification } = require('./notificationController');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { cylinderType, quantity, deliveryAddress, scheduledDate, notes } = req.body;

        // Validate required fields
        if (!cylinderType || !quantity || !deliveryAddress || !scheduledDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Calculate amount based on cylinder type and quantity
        const prices = {
            '14.2kg': 900,
            '19kg': 1200,
            '5kg': 450
        };

        const amount = prices[cylinderType] * quantity;

        // Create booking
        const booking = await Booking.create({
            userId: req.user.id,
            cylinderType,
            quantity,
            deliveryAddress,
            scheduledDate,
            amount,
            notes
        });

        // Create delivery record
        await Delivery.create({
            bookingId: booking._id
        });

        // Populate user details
        await booking.populate('userId', 'name email phone');

        // Send booking confirmation notification
        await sendNotification('booking_confirmation', {
            user: booking.userId,
            booking
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        // Build query
        const query = { userId: req.user.id };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get bookings
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('userId', 'name email phone');

        // Get total count
        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        // Get delivery details
        const delivery = await Delivery.findOne({ bookingId: booking._id })
            .populate('deliveryPersonId', 'name phone');

        res.status(200).json({
            success: true,
            booking,
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Check if booking can be updated
        if (['delivered', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update ${booking.status} booking`
            });
        }

        // Update allowed fields
        const allowedUpdates = ['deliveryAddress', 'scheduledDate', 'notes'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field]) {
                updates[field] = req.body[field];
            }
        });

        booking = await Booking.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Delivery)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide status'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update status
        booking.status = status;

        // If delivered, set delivery date
        if (status === 'delivered') {
            booking.deliveryDate = new Date();
            booking.paymentStatus = 'completed';
        }

        await booking.save();

        // Update delivery status
        const delivery = await Delivery.findOne({ bookingId: booking._id });
        if (delivery) {
            if (status === 'confirmed') delivery.status = 'assigned';
            if (status === 'processing') delivery.status = 'picked-up';
            if (status === 'out-for-delivery') delivery.status = 'in-transit';
            if (status === 'delivered') delivery.markDelivered();
            await delivery.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled
        if (['delivered', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel ${booking.status} booking`
            });
        }

        // Update booking
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by user';
        booking.cancelledAt = new Date();
        await booking.save();

        // Update delivery status
        const delivery = await Delivery.findOne({ bookingId: booking._id });
        if (delivery) {
            delivery.status = 'cancelled';
            await delivery.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
};

// @desc    Get booking history
// @route   GET /api/bookings/history
// @access  Private
exports.getBookingHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email phone');

        // Group by status
        const history = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            processing: bookings.filter(b => b.status === 'processing').length,
            'out-for-delivery': bookings.filter(b => b.status === 'out-for-delivery').length,
            delivered: bookings.filter(b => b.status === 'delivered').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            bookings
        };

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking history',
            error: error.message
        });
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, startDate, endDate } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get bookings
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('userId', 'name email phone');

        // Get total count
        const total = await Booking.countDocuments(query);

        // Get statistics
        const stats = {
            total: await Booking.countDocuments(),
            pending: await Booking.countDocuments({ status: 'pending' }),
            confirmed: await Booking.countDocuments({ status: 'confirmed' }),
            processing: await Booking.countDocuments({ status: 'processing' }),
            'out-for-delivery': await Booking.countDocuments({ status: 'out-for-delivery' }),
            delivered: await Booking.countDocuments({ status: 'delivered' }),
            cancelled: await Booking.countDocuments({ status: 'cancelled' })
        };

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            stats,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};
