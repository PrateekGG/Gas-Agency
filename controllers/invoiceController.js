const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get all invoices for user
// @route   GET /api/invoices
// @access  Private
exports.getMyInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId: req.user.id };
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const invoices = await Invoice.find(query)
            .populate('bookingId', 'bookingNumber cylinderType quantity')
            .populate('paymentId', 'transactionId paymentMethod')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            success: true,
            count: invoices.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices',
            error: error.message
        });
    }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('userId', 'name email phone address')
            .populate('bookingId', 'bookingNumber cylinderType quantity deliveryAddress')
            .populate('paymentId', 'transactionId paymentMethod paidAt');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check authorization
        if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice',
            error: error.message
        });
    }
};

// @desc    Generate invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
exports.generateInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('userId', 'name email phone address')
            .populate('bookingId', 'bookingNumber cylinderType quantity deliveryAddress')
            .populate('paymentId', 'transactionId paymentMethod paidAt');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check authorization
        if (invoice.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('GasFlow', 50, 50);
        doc.fontSize(10).text('Gas Agency Management System', 50, 75);
        doc.fontSize(10).text('Email: support@gasflow.com', 50, 90);
        doc.fontSize(10).text('Phone: +91 1234567890', 50, 105);

        // Invoice title
        doc.fontSize(25).text('INVOICE', 400, 50);
        doc.fontSize(12).text(invoice.invoiceNumber, 400, 80);

        // Line
        doc.moveTo(50, 130).lineTo(550, 130).stroke();

        // Customer details
        doc.fontSize(12).text('Bill To:', 50, 150);
        doc.fontSize(10).text(invoice.userId.name, 50, 170);
        doc.text(invoice.userId.email, 50, 185);
        doc.text(invoice.userId.phone, 50, 200);
        if (invoice.userId.address) {
            doc.text(`${invoice.userId.address.street}, ${invoice.userId.address.city}`, 50, 215);
            doc.text(`${invoice.userId.address.state} - ${invoice.userId.address.pincode}`, 50, 230);
        }

        // Invoice details
        doc.text('Invoice Date:', 350, 150);
        doc.text(new Date(invoice.createdAt).toLocaleDateString(), 450, 150);

        if (invoice.paidDate) {
            doc.text('Payment Date:', 350, 170);
            doc.text(new Date(invoice.paidDate).toLocaleDateString(), 450, 170);
        }

        doc.text('Status:', 350, 190);
        doc.text(invoice.status.toUpperCase(), 450, 190);

        // Items table
        const tableTop = 280;
        doc.fontSize(12).text('Description', 50, tableTop);
        doc.text('Quantity', 300, tableTop);
        doc.text('Unit Price', 380, tableTop);
        doc.text('Amount', 480, tableTop);

        doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

        let yPosition = tableTop + 30;
        invoice.items.forEach(item => {
            doc.fontSize(10).text(item.description, 50, yPosition);
            doc.text(item.quantity.toString(), 300, yPosition);
            doc.text(`₹${item.unitPrice.toFixed(2)}`, 380, yPosition);
            doc.text(`₹${item.amount.toFixed(2)}`, 480, yPosition);
            yPosition += 25;
        });

        // Totals
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 20;

        doc.fontSize(10).text('Subtotal:', 380, yPosition);
        doc.text(`₹${invoice.subtotal.toFixed(2)}`, 480, yPosition);
        yPosition += 20;

        if (invoice.tax.cgst > 0) {
            doc.text('CGST (9%):', 380, yPosition);
            doc.text(`₹${invoice.tax.cgst.toFixed(2)}`, 480, yPosition);
            yPosition += 20;
        }

        if (invoice.tax.sgst > 0) {
            doc.text('SGST (9%):', 380, yPosition);
            doc.text(`₹${invoice.tax.sgst.toFixed(2)}`, 480, yPosition);
            yPosition += 20;
        }

        if (invoice.discount > 0) {
            doc.text('Discount:', 380, yPosition);
            doc.text(`-₹${invoice.discount.toFixed(2)}`, 480, yPosition);
            yPosition += 20;
        }

        doc.moveTo(380, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 20;

        doc.fontSize(12).text('Total:', 380, yPosition);
        doc.text(`₹${invoice.total.toFixed(2)}`, 480, yPosition);

        // Footer
        doc.fontSize(8).text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });
        doc.text('This is a computer-generated invoice and does not require a signature.', 50, 715, { align: 'center', width: 500 });

        // Finalize PDF
        doc.end();

        // Update invoice with PDF URL (optional)
        // invoice.pdfUrl = `/invoices/${invoice.invoiceNumber}.pdf`;
        // await invoice.save();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating PDF',
            error: error.message
        });
    }
};

// @desc    Get all invoices (Admin)
// @route   GET /api/invoices/admin/all
// @access  Private (Admin)
exports.getAllInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        const query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const invoices = await Invoice.find(query)
            .populate('userId', 'name email phone')
            .populate('bookingId', 'bookingNumber')
            .populate('paymentId', 'transactionId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            success: true,
            count: invoices.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices',
            error: error.message
        });
    }
};
