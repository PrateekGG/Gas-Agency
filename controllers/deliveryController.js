const Delivery = require('../models/Delivery');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendNotification } = require('./notificationController');

// @desc    Get delivery details
// @route   GET /api/delivery/:bookingId
// @access  Private
exports.getDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ bookingId: req.params.bookingId })
            .populate('deliveryPersonId', 'name phone')
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'userId',
                    select: 'name email phone'
                }
            });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Check authorization
        const booking = await Booking.findById(req.params.bookingId);
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'delivery') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery',
            error: error.message
        });
    }
};

// @desc    Assign delivery person
// @route   POST /api/delivery/:bookingId/assign
// @access  Private (Admin)
exports.assignDelivery = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;

        const delivery = await Delivery.findOne({ bookingId: req.params.bookingId });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Get delivery person details
        const deliveryPerson = await User.findById(deliveryPersonId);
        if (!deliveryPerson || deliveryPerson.role !== 'delivery') {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery person'
            });
        }

        // Assign delivery person
        delivery.assignDeliveryPerson(
            deliveryPerson._id,
            deliveryPerson.name,
            deliveryPerson.phone
        );
        await delivery.save();

        // Update booking status
        const booking = await Booking.findById(req.params.bookingId).populate('userId');
        if (booking) {
            booking.status = 'confirmed';
            await booking.save();

            // Send notification
            await sendNotification('delivery_update', {
                user: booking.userId,
                booking,
                delivery
            });
        }

        res.status(200).json({
            success: true,
            message: 'Delivery person assigned successfully',
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning delivery',
            error: error.message
        });
    }
};

// @desc    Update delivery location
// @route   PUT /api/delivery/:bookingId/location
// @access  Private (Delivery)
exports.updateLocation = async (req, res) => {
    try {
        const { longitude, latitude, address } = req.body;

        const delivery = await Delivery.findOne({ bookingId: req.params.bookingId });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Check if user is assigned delivery person
        if (delivery.deliveryPersonId && delivery.deliveryPersonId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Update location
        delivery.updateLocation(longitude, latitude, address);
        await delivery.save();

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:bookingId/status
// @access  Private (Delivery/Admin)
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const delivery = await Delivery.findOne({ bookingId: req.params.bookingId });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Update status based on action
        if (status === 'picked-up') {
            delivery.markPickedUp();
        } else if (status === 'in-transit') {
            delivery.markInTransit();
        } else if (status === 'delivered') {
            delivery.markDelivered(req.body.signature, req.body.deliveryProof);
        } else if (status === 'failed') {
            delivery.markFailed(req.body.failureReason);
        } else {
            delivery.status = status;
        }

        await delivery.save();

        // Update booking status
        const booking = await Booking.findById(req.params.bookingId).populate('userId');
        if (booking) {
            if (status === 'delivered') {
                booking.status = 'delivered';
                booking.deliveryDate = new Date();
            } else if (status === 'in-transit') {
                booking.status = 'out-for-delivery';
            } else if (status === 'picked-up') {
                booking.status = 'processing';
            }
            await booking.save();

            // Send notification
            await sendNotification('delivery_update', {
                user: booking.userId,
                booking,
                delivery
            });
        }

        res.status(200).json({
            success: true,
            message: 'Delivery status updated successfully',
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating delivery status',
            error: error.message
        });
    }
};

// @desc    Get deliveries for delivery person
// @route   GET /api/delivery/my-deliveries
// @access  Private (Delivery)
exports.getMyDeliveries = async (req, res) => {
    try {
        const { status } = req.query;

        const query = { deliveryPersonId: req.user.id };
        if (status) {
            query.status = status;
        }

        const deliveries = await Delivery.find(query)
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'userId',
                    select: 'name email phone'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: deliveries.length,
            deliveries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deliveries',
            error: error.message
        });
    }
};

// @desc    Get all deliveries (Admin)
// @route   GET /api/delivery/admin/all
// @access  Private (Admin)
exports.getAllDeliveries = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const deliveries = await Delivery.find(query)
            .populate('deliveryPersonId', 'name phone')
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'userId',
                    select: 'name email phone'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Delivery.countDocuments(query);

        res.status(200).json({
            success: true,
            count: deliveries.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            deliveries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deliveries',
            error: error.message
        });
    }
};

// @desc    Add delivery rating
// @route   POST /api/delivery/:bookingId/rate
// @access  Private
exports.rateDelivery = async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        const delivery = await Delivery.findOne({ bookingId: req.params.bookingId });

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        // Check if delivery is completed
        if (delivery.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Can only rate completed deliveries'
            });
        }

        // Check authorization
        const booking = await Booking.findById(req.params.bookingId);
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        delivery.rating = rating;
        delivery.feedback = feedback;
        await delivery.save();

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            delivery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rating delivery',
            error: error.message
        });
    }
};
