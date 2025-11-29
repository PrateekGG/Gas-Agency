const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    getBookingHistory,
    getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - None

// Protected routes (Customer)
router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);
router.get('/history', protect, getBookingHistory);
router.get('/:id', protect, getBooking);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, cancelBooking);

// Protected routes (Admin/Delivery)
router.put('/:id/status', protect, authorize('admin', 'delivery'), updateBookingStatus);

// Protected routes (Admin only)
router.get('/admin/all', protect, authorize('admin'), getAllBookings);

module.exports = router;
