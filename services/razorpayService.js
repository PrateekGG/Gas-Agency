const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createOrder = async (amount, currency = 'INR', receipt) => {
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
};

// Verify payment signature
exports.verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === signature;
    } catch (error) {
        throw new Error(`Signature verification failed: ${error.message}`);
    }
};

// Fetch payment details
exports.fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        throw new Error(`Failed to fetch payment: ${error.message}`);
    }
};

// Create refund
exports.createRefund = async (paymentId, amount = null) => {
    try {
        const options = {};
        if (amount) {
            options.amount = amount * 100; // Amount in paise
        }

        const refund = await razorpay.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        throw new Error(`Refund creation failed: ${error.message}`);
    }
};

// Fetch refund details
exports.fetchRefund = async (refundId) => {
    try {
        const refund = await razorpay.refunds.fetch(refundId);
        return refund;
    } catch (error) {
        throw new Error(`Failed to fetch refund: ${error.message}`);
    }
};

// Fetch all refunds for a payment
exports.fetchAllRefunds = async (paymentId) => {
    try {
        const refunds = await razorpay.payments.fetchMultipleRefund(paymentId);
        return refunds;
    } catch (error) {
        throw new Error(`Failed to fetch refunds: ${error.message}`);
    }
};

module.exports = {
    razorpay,
    createOrder: exports.createOrder,
    verifyPaymentSignature: exports.verifyPaymentSignature,
    fetchPayment: exports.fetchPayment,
    createRefund: exports.createRefund,
    fetchRefund: exports.fetchRefund,
    fetchAllRefunds: exports.fetchAllRefunds
};
