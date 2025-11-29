const express = require('express');
const router = express.Router();
const {
    getDelivery,
    assignDelivery,
    updateLocation,
    updateDeliveryStatus,
    getMyDeliveries,
    getAllDeliveries,
    rateDelivery
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Customer/Delivery/Admin)
router.get('/:bookingId', protect, getDelivery);
router.post('/:bookingId/rate', protect, rateDelivery);

// Protected routes (Delivery)
router.get('/my-deliveries', protect, authorize('delivery'), getMyDeliveries);
router.put('/:bookingId/location', protect, authorize('delivery', 'admin'), updateLocation);
router.put('/:bookingId/status', protect, authorize('delivery', 'admin'), updateDeliveryStatus);

// Protected routes (Admin)
router.post('/:bookingId/assign', protect, authorize('admin'), assignDelivery);
router.get('/admin/all', protect, authorize('admin'), getAllDeliveries);

module.exports = router;
