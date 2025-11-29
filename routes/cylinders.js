const express = require('express');
const router = express.Router();
const {
    getMyCylinders,
    getCylinder,
    createCylinder,
    updateCylinderStatus,
    addToHistory,
    getDueCylinders,
    returnCylinder
} = require('../controllers/cylinderController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Customer)
router.get('/', protect, getMyCylinders);
router.get('/due', protect, getDueCylinders);
router.get('/:id', protect, getCylinder);
router.put('/:id/return', protect, returnCylinder);

// Protected routes (Admin/Delivery)
router.post('/', protect, authorize('admin'), createCylinder);
router.put('/:id/status', protect, authorize('admin', 'delivery'), updateCylinderStatus);
router.post('/:id/history', protect, authorize('admin', 'delivery'), addToHistory);

module.exports = router;
