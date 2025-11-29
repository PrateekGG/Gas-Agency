const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'card', 'upi', 'wallet'],
        required: [true, 'Payment method is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    gatewayResponse: {
        orderId: String,
        paymentId: String,
        signature: String,
        status: String,
        method: String,
        errorCode: String,
        errorDescription: String,
        rawResponse: mongoose.Schema.Types.Mixed
    },
    refundDetails: {
        refundId: String,
        refundAmount: Number,
        refundDate: Date,
        refundReason: String,
        refundStatus: String
    },
    paidAt: Date,
    failedAt: Date,
    refundedAt: Date,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate transaction ID before saving
paymentSchema.pre('save', async function (next) {
    if (this.isNew && !this.transactionId) {
        this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Mark payment as completed
paymentSchema.methods.markCompleted = function (gatewayData) {
    this.status = 'completed';
    this.paidAt = new Date();
    if (gatewayData) {
        this.gatewayResponse = { ...this.gatewayResponse, ...gatewayData };
    }
};

// Mark payment as failed
paymentSchema.methods.markFailed = function (errorData) {
    this.status = 'failed';
    this.failedAt = new Date();
    if (errorData) {
        this.gatewayResponse = { ...this.gatewayResponse, ...errorData };
    }
};

// Process refund
paymentSchema.methods.processRefund = function (refundData) {
    this.status = 'refunded';
    this.refundedAt = new Date();
    this.refundDetails = {
        ...this.refundDetails,
        ...refundData,
        refundDate: new Date()
    };
};

// Index for faster queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
