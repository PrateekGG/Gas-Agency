const express = require('express');
const router = express.Router();
const { testNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Admin only)
router.post('/test', protect, authorize('admin'), testNotification);

module.exports = router;
