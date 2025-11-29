const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        cgst: {
            type: Number,
            default: 0
        },
        sgst: {
            type: Number,
            default: 0
        },
        igst: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['draft', 'issued', 'paid', 'cancelled', 'refunded'],
        default: 'draft'
    },
    pdfUrl: String,
    dueDate: Date,
    paidDate: Date,
    notes: String,
    termsAndConditions: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        this.invoiceNumber = `INV${year}${month}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Calculate totals
invoiceSchema.methods.calculateTotals = function () {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate tax (assuming 18% GST split as 9% CGST + 9% SGST)
    const taxRate = 0.18;
    const taxAmount = this.subtotal * taxRate;
    this.tax.cgst = taxAmount / 2;
    this.tax.sgst = taxAmount / 2;
    this.tax.total = taxAmount;

    // Calculate total
    this.total = this.subtotal + this.tax.total - this.discount;
};

// Mark invoice as paid
invoiceSchema.methods.markPaid = function () {
    this.status = 'paid';
    this.paidDate = new Date();
};

// Cancel invoice
invoiceSchema.methods.cancel = function () {
    this.status = 'cancelled';
};

// Index for faster queries
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ bookingId: 1 });
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
