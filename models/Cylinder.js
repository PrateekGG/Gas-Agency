const mongoose = require('mongoose');

const cylinderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    cylinderId: {
        type: String,
        unique: true,
        required: [true, 'Cylinder ID is required']
    },
    type: {
        type: String,
        enum: ['14.2kg', '19kg', '5kg'],
        required: [true, 'Cylinder type is required']
    },
    status: {
        type: String,
        enum: ['active', 'empty', 'maintenance', 'returned'],
        default: 'active'
    },
    serialNumber: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    lastRefillDate: {
        type: Date,
        default: Date.now
    },
    nextDueDate: {
        type: Date
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    bookingHistory: [{
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        date: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            enum: ['delivered', 'refilled', 'returned', 'maintenance']
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
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

// Generate cylinder ID before saving
cylinderSchema.pre('save', async function (next) {
    if (this.isNew && !this.cylinderId) {
        const count = await mongoose.model('Cylinder').countDocuments();
        this.cylinderId = `CYL${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Calculate next due date (90 days from last refill)
cylinderSchema.methods.calculateNextDueDate = function () {
    if (this.lastRefillDate) {
        const dueDate = new Date(this.lastRefillDate);
        dueDate.setDate(dueDate.getDate() + 90);
        this.nextDueDate = dueDate;
    }
};

// Check if cylinder is due for refill
cylinderSchema.methods.isDue = function () {
    if (!this.nextDueDate) return false;
    return new Date() >= this.nextDueDate;
};

// Index for faster queries
cylinderSchema.index({ userId: 1, status: 1 });
cylinderSchema.index({ cylinderId: 1 });

module.exports = mongoose.model('Cylinder', cylinderSchema);
