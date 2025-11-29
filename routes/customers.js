const express = require('express');
const router = express.Router();
const {
    getCustomerProfile,
    getCustomerHistory,
    getCustomerAnalytics,
    getLoyaltyPoints,
    getCustomerPreferences,
    updateCustomerPreferences,
    getAllCustomers
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Customer)
router.get('/profile', protect, getCustomerProfile);
router.get('/history', protect, getCustomerHistory);
router.get('/analytics', protect, getCustomerAnalytics);
router.get('/loyalty', protect, getLoyaltyPoints);
router.get('/preferences', protect, getCustomerPreferences);
router.put('/preferences', protect, updateCustomerPreferences);

// Protected routes (Admin)
router.get('/admin/all', protect, authorize('admin'), getAllCustomers);

module.exports = router;
