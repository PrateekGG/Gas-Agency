const express = require('express');
const router = express.Router();
const {
    getMyInvoices,
    getInvoice,
    generateInvoicePDF,
    getAllInvoices
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Customer)
router.get('/', protect, getMyInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/pdf', protect, generateInvoicePDF);

// Protected routes (Admin)
router.get('/admin/all', protect, authorize('admin'), getAllInvoices);

module.exports = router;
