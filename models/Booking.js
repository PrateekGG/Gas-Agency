const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    bookingNumber: {
        type: String,
        unique: true,
        required: true
    },
    cylinderType: {
        type: String,
        enum: ['14.2kg', '19kg', '5kg'],
        required: [true, 'Cylinder type is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [10, 'Maximum 10 cylinders per booking']
    },
    deliveryAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        landmark: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    deliveryDate: Date,
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'card'],
        default: 'cash'
    },
    notes: String,
    cancellationReason: String,
    cancelledAt: Date,
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

// Generate booking number before saving
bookingSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingNumber = `BK${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
