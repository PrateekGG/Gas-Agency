const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        unique: true
    },
    deliveryPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryPersonName: String,
    deliveryPersonPhone: String,
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'nearby', 'delivered', 'failed', 'cancelled'],
        default: 'pending'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: String,
        updatedAt: Date
    },
    route: [{
        location: {
            type: {
                type: String,
                enum: ['Point']
            },
            coordinates: [Number]
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    estimatedTime: Date,
    actualDeliveryTime: Date,
    assignedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    signature: {
        data: String, // Base64 encoded signature
        name: String,
        timestamp: Date
    },
    deliveryProof: {
        photoUrl: String,
        notes: String
    },
    failureReason: String,
    notes: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: String,
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

// Create geospatial index for location queries
deliverySchema.index({ 'currentLocation': '2dsphere' });
deliverySchema.index({ bookingId: 1 });
deliverySchema.index({ deliveryPersonId: 1, status: 1 });
deliverySchema.index({ status: 1 });

// Update current location
deliverySchema.methods.updateLocation = function (longitude, latitude, address) {
    this.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address,
        updatedAt: new Date()
    };

    // Add to route history
    this.route.push({
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        },
        timestamp: new Date()
    });
};

// Assign delivery person
deliverySchema.methods.assignDeliveryPerson = function (personId, personName, personPhone) {
    this.deliveryPersonId = personId;
    this.deliveryPersonName = personName;
    this.deliveryPersonPhone = personPhone;
    this.status = 'assigned';
    this.assignedAt = new Date();
};

// Mark as picked up
deliverySchema.methods.markPickedUp = function () {
    this.status = 'picked-up';
    this.pickedUpAt = new Date();
};

// Mark as in transit
deliverySchema.methods.markInTransit = function () {
    this.status = 'in-transit';
};

// Mark as delivered
deliverySchema.methods.markDelivered = function (signatureData, proofData) {
    this.status = 'delivered';
    this.actualDeliveryTime = new Date();
    this.deliveredAt = new Date();

    if (signatureData) {
        this.signature = {
            ...signatureData,
            timestamp: new Date()
        };
    }

    if (proofData) {
        this.deliveryProof = proofData;
    }
};

// Mark as failed
deliverySchema.methods.markFailed = function (reason) {
    this.status = 'failed';
    this.failureReason = reason;
};

// Calculate distance from current location to destination
deliverySchema.methods.calculateDistance = function (destLongitude, destLatitude) {
    if (!this.currentLocation || !this.currentLocation.coordinates) {
        return null;
    }

    const [lon1, lat1] = this.currentLocation.coordinates;
    const lon2 = destLongitude;
    const lat2 = destLatitude;

    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in kilometers
};

module.exports = mongoose.model('Delivery', deliverySchema);
