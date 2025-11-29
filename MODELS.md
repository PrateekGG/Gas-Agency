# Database Models Documentation

Complete MongoDB schema for the Gas Agency Management System.

## Models Overview

| Model | Purpose | Key Features |
|-------|---------|--------------|
| User | User accounts | Auth, roles, password hashing |
| Booking | Gas cylinder bookings | Status tracking, auto-numbering |
| Cylinder | Cylinder inventory | Refill tracking, due dates |
| Payment | Payment transactions | Gateway integration, refunds |
| Invoice | Billing & invoices | Auto-numbering, tax calculation |
| Delivery | Delivery tracking | GPS tracking, route history |

## User Model

**File**: `models/User.js`

### Schema
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (customer/admin/delivery),
  address: {
    street, city, state, pincode, landmark
  },
  isActive: Boolean,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

### Methods
- `comparePassword(password)` - Compare entered password
- `generateToken()` - Generate JWT token
- `getResetPasswordToken()` - Generate password reset token

## Booking Model

**File**: `models/Booking.js`

### Schema
```javascript
{
  userId: ObjectId (ref: User),
  bookingNumber: String (unique, auto-generated),
  cylinderType: String (14.2kg/19kg/5kg),
  quantity: Number (1-10),
  deliveryAddress: {
    street, city, state, pincode, landmark
  },
  status: String (pending/confirmed/processing/out-for-delivery/delivered/cancelled),
  scheduledDate: Date,
  deliveryDate: Date,
  amount: Number,
  paymentStatus: String (pending/completed/failed/refunded),
  paymentMethod: String (cash/online/card),
  notes: String,
  cancellationReason: String,
  cancelledAt: Date
}
```

### Features
- Auto-generates booking number: `BK{timestamp}{count}`
- Indexed for fast queries by user, status, and booking number
- Tracks payment status separately

## Cylinder Model

**File**: `models/Cylinder.js`

### Schema
```javascript
{
  userId: ObjectId (ref: User),
  cylinderId: String (unique, auto-generated),
  type: String (14.2kg/19kg/5kg),
  status: String (active/empty/maintenance/returned),
  serialNumber: String (unique),
  lastRefillDate: Date,
  nextDueDate: Date,
  securityDeposit: Number,
  bookingHistory: [{
    bookingId: ObjectId,
    date: Date,
    action: String (delivered/refilled/returned/maintenance)
  }],
  isActive: Boolean
}
```

### Methods
- `calculateNextDueDate()` - Calculate next refill due date (90 days)
- `isDue()` - Check if cylinder is due for refill

### Features
- Auto-generates cylinder ID: `CYL{timestamp}{count}`
- Tracks complete refill history
- Calculates due dates automatically

## Payment Model

**File**: `models/Payment.js`

### Schema
```javascript
{
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  transactionId: String (unique, auto-generated),
  paymentMethod: String (cash/online/card/upi/wallet),
  amount: Number,
  currency: String (default: INR),
  status: String (pending/processing/completed/failed/refunded/cancelled),
  gatewayResponse: {
    orderId, paymentId, signature, status, method,
    errorCode, errorDescription, rawResponse
  },
  refundDetails: {
    refundId, refundAmount, refundDate, refundReason, refundStatus
  },
  paidAt: Date,
  failedAt: Date,
  refundedAt: Date,
  notes: String
}
```

### Methods
- `markCompleted(gatewayData)` - Mark payment as completed
- `markFailed(errorData)` - Mark payment as failed
- `processRefund(refundData)` - Process refund

### Features
- Auto-generates transaction ID: `TXN{timestamp}{random}`
- Stores complete gateway response
- Handles refunds with full tracking

## Invoice Model

**File**: `models/Invoice.js`

### Schema
```javascript
{
  invoiceNumber: String (unique, auto-generated),
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  paymentId: ObjectId (ref: Payment),
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  subtotal: Number,
  tax: {
    cgst: Number,
    sgst: Number,
    igst: Number,
    total: Number
  },
  discount: Number,
  total: Number,
  currency: String (default: INR),
  status: String (draft/issued/paid/cancelled/refunded),
  pdfUrl: String,
  dueDate: Date,
  paidDate: Date,
  notes: String,
  termsAndConditions: String
}
```

### Methods
- `calculateTotals()` - Calculate subtotal, tax, and total
- `markPaid()` - Mark invoice as paid
- `cancel()` - Cancel invoice

### Features
- Auto-generates invoice number: `INV{YYYYMM}{count}`
- Calculates GST (18% split as CGST 9% + SGST 9%)
- Supports PDF generation

## Delivery Model

**File**: `models/Delivery.js`

### Schema
```javascript
{
  bookingId: ObjectId (ref: Booking, unique),
  deliveryPersonId: ObjectId (ref: User),
  deliveryPersonName: String,
  deliveryPersonPhone: String,
  status: String (pending/assigned/picked-up/in-transit/nearby/delivered/failed/cancelled),
  currentLocation: {
    type: Point,
    coordinates: [longitude, latitude],
    address: String,
    updatedAt: Date
  },
  route: [{
    location: { type: Point, coordinates: [Number] },
    timestamp: Date
  }],
  estimatedTime: Date,
  actualDeliveryTime: Date,
  assignedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  signature: {
    data: String (base64),
    name: String,
    timestamp: Date
  },
  deliveryProof: {
    photoUrl: String,
    notes: String
  },
  failureReason: String,
  notes: String,
  rating: Number (1-5),
  feedback: String
}
```

### Methods
- `updateLocation(lon, lat, address)` - Update current location
- `assignDeliveryPerson(id, name, phone)` - Assign delivery person
- `markPickedUp()` - Mark as picked up
- `markInTransit()` - Mark as in transit
- `markDelivered(signature, proof)` - Mark as delivered
- `markFailed(reason)` - Mark as failed
- `calculateDistance(destLon, destLat)` - Calculate distance to destination

### Features
- Geospatial indexing for location queries
- Complete route history tracking
- Digital signature capture
- Photo proof of delivery
- Distance calculation using Haversine formula

## Relationships

```
User
  ├── Bookings (1:N)
  ├── Cylinders (1:N)
  ├── Payments (1:N)
  └── Invoices (1:N)

Booking
  ├── Payment (1:1)
  ├── Invoice (1:1)
  └── Delivery (1:1)

Cylinder
  └── Booking History (N:M)
```

## Indexes

All models include indexes for optimal query performance:

- **User**: email (unique)
- **Booking**: userId + createdAt, bookingNumber, status
- **Cylinder**: userId + status, cylinderId
- **Payment**: bookingId, userId + createdAt, transactionId, status
- **Invoice**: invoiceNumber, bookingId, userId + createdAt, status
- **Delivery**: currentLocation (2dsphere), bookingId, deliveryPersonId + status

## Auto-Generated Fields

| Model | Field | Format | Example |
|-------|-------|--------|---------|
| Booking | bookingNumber | BK{timestamp}{count} | BK17012345670001 |
| Cylinder | cylinderId | CYL{timestamp}{count} | CYL17012345670001 |
| Payment | transactionId | TXN{timestamp}{random} | TXN1701234567ABC |
| Invoice | invoiceNumber | INV{YYYYMM}{count} | INV20241100001 |

## Usage Examples

### Create a Booking
```javascript
const booking = await Booking.create({
  userId: user._id,
  cylinderType: '14.2kg',
  quantity: 2,
  deliveryAddress: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  scheduledDate: new Date(),
  amount: 1800
});
```

### Track Delivery
```javascript
const delivery = await Delivery.findOne({ bookingId: booking._id });
delivery.updateLocation(72.8777, 19.0760, 'Near Gateway of India');
delivery.markInTransit();
await delivery.save();
```

### Generate Invoice
```javascript
const invoice = await Invoice.create({
  bookingId: booking._id,
  userId: user._id,
  items: [{
    description: '14.2kg Gas Cylinder',
    quantity: 2,
    unitPrice: 900,
    amount: 1800
  }]
});
invoice.calculateTotals();
await invoice.save();
```

## Next Steps

With all models created, you can now:
1. Create API routes for each model
2. Implement CRUD operations
3. Add business logic in controllers
4. Integrate payment gateways
5. Implement real-time tracking
6. Generate PDF invoices
