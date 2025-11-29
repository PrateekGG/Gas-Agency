const Cylinder = require('../models/Cylinder');
const Booking = require('../models/Booking');

// @desc    Get all cylinders for logged in user
// @route   GET /api/cylinders
// @access  Private
exports.getMyCylinders = async (req, res) => {
    try {
        const cylinders = await Cylinder.find({ userId: req.user.id, isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: cylinders.length,
            cylinders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cylinders',
            error: error.message
        });
    }
};

// @desc    Get single cylinder
// @route   GET /api/cylinders/:id
// @access  Private
exports.getCylinder = async (req, res) => {
    try {
        const cylinder = await Cylinder.findById(req.params.id)
            .populate({
                path: 'bookingHistory.bookingId',
                select: 'bookingNumber status deliveryDate'
            });

        if (!cylinder) {
            return res.status(404).json({
                success: false,
                message: 'Cylinder not found'
            });
        }

        // Check if user owns this cylinder or is admin
        if (cylinder.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this cylinder'
            });
        }

        res.status(200).json({
            success: true,
            cylinder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cylinder',
            error: error.message
        });
    }
};

// @desc    Create cylinder (usually done automatically with booking)
// @route   POST /api/cylinders
// @access  Private (Admin)
exports.createCylinder = async (req, res) => {
    try {
        const { userId, type, serialNumber, securityDeposit } = req.body;

        const cylinder = await Cylinder.create({
            userId: userId || req.user.id,
            type,
            serialNumber,
            securityDeposit: securityDeposit || 0
        });

        // Calculate next due date
        cylinder.calculateNextDueDate();
        await cylinder.save();

        res.status(201).json({
            success: true,
            message: 'Cylinder created successfully',
            cylinder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating cylinder',
            error: error.message
        });
    }
};

// @desc    Update cylinder status
// @route   PUT /api/cylinders/:id/status
// @access  Private (Admin/Delivery)
exports.updateCylinderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide status'
            });
        }

        const cylinder = await Cylinder.findById(req.params.id);

        if (!cylinder) {
            return res.status(404).json({
                success: false,
                message: 'Cylinder not found'
            });
        }

        cylinder.status = status;

        // If refilled, update dates
        if (status === 'active') {
            cylinder.lastRefillDate = new Date();
            cylinder.calculateNextDueDate();
        }

        await cylinder.save();

        res.status(200).json({
            success: true,
            message: 'Cylinder status updated successfully',
            cylinder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cylinder status',
            error: error.message
        });
    }
};

// @desc    Add booking to cylinder history
// @route   POST /api/cylinders/:id/history
// @access  Private (Admin/Delivery)
exports.addToHistory = async (req, res) => {
    try {
        const { bookingId, action } = req.body;

        const cylinder = await Cylinder.findById(req.params.id);

        if (!cylinder) {
            return res.status(404).json({
                success: false,
                message: 'Cylinder not found'
            });
        }

        cylinder.bookingHistory.push({
            bookingId,
            action,
            date: new Date()
        });

        await cylinder.save();

        res.status(200).json({
            success: true,
            message: 'History updated successfully',
            cylinder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating history',
            error: error.message
        });
    }
};

// @desc    Get cylinders due for refill
// @route   GET /api/cylinders/due
// @access  Private
exports.getDueCylinders = async (req, res) => {
    try {
        const cylinders = await Cylinder.find({
            userId: req.user.id,
            isActive: true
        });

        const dueCylinders = cylinders.filter(cylinder => cylinder.isDue());

        res.status(200).json({
            success: true,
            count: dueCylinders.length,
            cylinders: dueCylinders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching due cylinders',
            error: error.message
        });
    }
};

// @desc    Return cylinder
// @route   PUT /api/cylinders/:id/return
// @access  Private
exports.returnCylinder = async (req, res) => {
    try {
        const cylinder = await Cylinder.findById(req.params.id);

        if (!cylinder) {
            return res.status(404).json({
                success: false,
                message: 'Cylinder not found'
            });
        }

        // Check if user owns this cylinder
        if (cylinder.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to return this cylinder'
            });
        }

        cylinder.status = 'returned';
        cylinder.isActive = false;
        await cylinder.save();

        res.status(200).json({
            success: true,
            message: 'Cylinder returned successfully',
            cylinder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error returning cylinder',
            error: error.message
        });
    }
};
