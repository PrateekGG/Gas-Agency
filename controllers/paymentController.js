const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const razorpayService = require('../services/razorpayService');
const { sendNotification } = require('./notificationController');

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
exports.createPaymentOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        // Get booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            bookingId,
            status: { $in: ['completed', 'processing'] }
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already exists for this booking'
            });
        }

        // Create Razorpay order
        const order = await razorpayService.createOrder(
            booking.amount,
            'INR',
            `booking_${booking.bookingNumber}`
        );

        // Create payment record
        const payment = await Payment.create({
            bookingId: booking._id,
            userId: req.user.id,
            amount: booking.amount,
            paymentMethod: 'online',
            status: 'pending',
            gatewayResponse: {
                orderId: order.id,
                status: order.status
            }
        });

        res.status(201).json({
            success: true,
            message: 'Payment order created successfully',
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            payment: {
                id: payment._id,
                transactionId: payment.transactionId
            },
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
        });
    }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature, paymentDbId } = req.body;

        if (!orderId || !paymentId || !signature || !paymentDbId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get payment from database
        const payment = await Payment.findById(paymentDbId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify signature
        const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

        if (!isValid) {
            payment.markFailed({ errorDescription: 'Invalid signature' });
            await payment.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Fetch payment details from Razorpay
        const razorpayPayment = await razorpayService.fetchPayment(paymentId);

        // Mark payment as completed
        payment.markCompleted({
            paymentId: razorpayPayment.id,
            orderId: razorpayPayment.order_id,
            signature,
            status: razorpayPayment.status,
            method: razorpayPayment.method,
            rawResponse: razorpayPayment
        });
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'completed';
            booking.paymentMethod = 'online';
            if (booking.status === 'pending') {
                booking.status = 'confirmed';
            }
            await booking.save();
        }

        // Create invoice
        const invoice = await Invoice.create({
            bookingId: booking._id,
            userId: payment.userId,
            paymentId: payment._id,
            items: [{
                description: `${booking.cylinderType} Gas Cylinder`,
                quantity: booking.quantity,
                unitPrice: booking.amount / booking.quantity,
                amount: booking.amount
            }],
            status: 'paid'
        });

        invoice.calculateTotals();
        invoice.markPaid();
        await invoice.save();

        // Send payment receipt notification
        const user = await require('../models/User').findById(payment.userId);
        await sendNotification('payment_receipt', {
            user,
            booking,
            payment,
            invoice
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            payment,
            booking,
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('bookingId', 'bookingNumber cylinderType quantity amount')
            .populate('userId', 'name email phone');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment or is admin
        if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment',
            error: error.message
        });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        // Build query
        const query = { userId: req.user.id };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get payments
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('bookingId', 'bookingNumber cylinderType quantity');

        // Get total count
        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history',
            error: error.message
        });
    }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
    try {
        const { amount, reason } = req.body;

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if payment is completed
        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed payments can be refunded'
            });
        }

        // Check if already refunded
        if (payment.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: 'Payment already refunded'
            });
        }

        // Create refund in Razorpay
        const refund = await razorpayService.createRefund(
            payment.gatewayResponse.paymentId,
            amount || payment.amount
        );

        // Update payment
        payment.processRefund({
            refundId: refund.id,
            refundAmount: refund.amount / 100,
            refundReason: reason || 'Refund requested',
            refundStatus: refund.status
        });
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'refunded';
            await booking.save();
        }

        // Update invoice
        const invoice = await Invoice.findOne({ paymentId: payment._id });
        if (invoice) {
            invoice.status = 'refunded';
            await invoice.save();
        }

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            payment,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// @desc    Get refund status
// @route   GET /api/payments/:id/refund-status
// @access  Private
exports.getRefundStatus = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment or is admin
        if (payment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (!payment.refundDetails || !payment.refundDetails.refundId) {
            return res.status(404).json({
                success: false,
                message: 'No refund found for this payment'
            });
        }

        // Fetch refund details from Razorpay
        const refund = await razorpayService.fetchRefund(payment.refundDetails.refundId);

        res.status(200).json({
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                createdAt: refund.created_at
            },
            paymentRefundDetails: payment.refundDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching refund status',
            error: error.message
        });
    }
};

// @desc    Cash payment (for delivery personnel)
// @route   POST /api/payments/cash
// @access  Private (Delivery/Admin)
exports.recordCashPayment = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and amount are required'
            });
        }

        // Get booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Create payment record
        const payment = await Payment.create({
            bookingId: booking._id,
            userId: booking.userId,
            amount,
            paymentMethod: 'cash',
            status: 'completed'
        });

        payment.markCompleted();
        await payment.save();

        // Update booking
        booking.paymentStatus = 'completed';
        booking.paymentMethod = 'cash';
        await booking.save();

        // Create invoice
        const invoice = await Invoice.create({
            bookingId: booking._id,
            userId: booking.userId,
            paymentId: payment._id,
            items: [{
                description: `${booking.cylinderType} Gas Cylinder`,
                quantity: booking.quantity,
                unitPrice: booking.amount / booking.quantity,
                amount: booking.amount
            }],
            status: 'paid'
        });

        invoice.calculateTotals();
        invoice.markPaid();
        await invoice.save();

        res.status(201).json({
            success: true,
            message: 'Cash payment recorded successfully',
            payment,
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording cash payment',
            error: error.message
        });
    }
};
