const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPayment,
    getPayment,
    getPaymentHistory,
    processRefund,
    getRefundStatus,
    recordCashPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Customer)
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPayment);
router.get('/:id/refund-status', protect, getRefundStatus);

// Protected routes (Delivery/Admin)
router.post('/cash', protect, authorize('delivery', 'admin'), recordCashPayment);

// Protected routes (Admin only)
router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
