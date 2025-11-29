const express = require('express');
const router = express.Router();
const {
    getDashboardAnalytics,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    generateReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin only
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/reports', generateReports);

module.exports = router;
