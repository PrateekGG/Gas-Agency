# Admin Panel & Delivery Tracking Guide

Complete guide for admin panel and delivery tracking features.

## Admin Panel

### Dashboard Analytics

Get comprehensive dashboard statistics:

```http
GET /api/admin/dashboard?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "users": {
      "total": 1500,
      "new": 150,
      "active": 1400
    },
    "bookings": {
      "total": 5000,
      "pending": 50,
      "confirmed": 100,
      "delivered": 4500,
      "cancelled": 350
    },
    "revenue": {
      "total": 4500000,
      "monthly": 450000
    },
    "cylinders": {
      "total": 3000,
      "active": 2500,
      "empty": 500
    },
    "deliveries": {
      "total": 5000,
      "inTransit": 75,
      "completed": 4800
    }
  },
  "recentBookings": [...],
  "topCustomers": [...]
}
```

### User Management

#### Get All Users
```http
GET /api/admin/users?role=customer&page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

#### Update User Status
```http
PUT /api/admin/users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Update User Role
```http
PUT /api/admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "delivery"
}
```

**Valid Roles:**
- `customer`
- `admin`
- `delivery`

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Reports Generation

```http
GET /api/admin/reports?type=revenue&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

**Report Types:**
- `revenue` - Daily revenue breakdown
- `bookings` - Booking status distribution
- `cylinders` - Cylinder inventory by type

## Delivery Tracking

### Get Delivery Details

```http
GET /api/delivery/:bookingId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "delivery": {
    "_id": "...",
    "bookingId": {...},
    "deliveryPersonId": {...},
    "deliveryPersonName": "John Doe",
    "deliveryPersonPhone": "+919876543210",
    "status": "in-transit",
    "currentLocation": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760],
      "address": "Near Gateway of India",
      "updatedAt": "2024-11-29T10:30:00Z"
    },
    "estimatedTime": "2024-11-29T12:00:00Z"
  }
}
```

### Assign Delivery Person (Admin)

```http
POST /api/delivery/:bookingId/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "deliveryPersonId": "delivery_person_id_here"
}
```

### Update Location (Delivery Person)

```http
PUT /api/delivery/:bookingId/location
Authorization: Bearer <delivery_token>
Content-Type: application/json

{
  "longitude": 72.8777,
  "latitude": 19.0760,
  "address": "Near Gateway of India"
}
```

### Update Delivery Status

```http
PUT /api/delivery/:bookingId/status
Authorization: Bearer <delivery_token>
Content-Type: application/json

{
  "status": "in-transit"
}
```

**Delivery Statuses:**
- `pending` - Not yet assigned
- `assigned` - Assigned to delivery person
- `picked-up` - Order picked up
- `in-transit` - On the way
- `nearby` - Near destination
- `delivered` - Successfully delivered
- `failed` - Delivery failed
- `cancelled` - Delivery cancelled

### Mark as Delivered

```http
PUT /api/delivery/:bookingId/status
Authorization: Bearer <delivery_token>
Content-Type: application/json

{
  "status": "delivered",
  "signature": {
    "data": "base64_encoded_signature",
    "name": "Customer Name"
  },
  "deliveryProof": {
    "photoUrl": "/uploads/proof.jpg",
    "notes": "Delivered successfully"
  }
}
```

### Get My Deliveries (Delivery Person)

```http
GET /api/delivery/my-deliveries?status=in-transit
Authorization: Bearer <delivery_token>
```

### Get All Deliveries (Admin)

```http
GET /api/delivery/admin/all?status=in-transit&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Rate Delivery (Customer)

```http
POST /api/delivery/:bookingId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Excellent service!"
}
```

## Delivery Flow

```
1. Booking Created → Delivery record created (status: pending)
2. Admin assigns delivery person → Status: assigned
3. Delivery person picks up → Status: picked-up
4. Delivery person starts delivery → Status: in-transit
5. Near customer location → Status: nearby
6. Delivery completed → Status: delivered
7. Customer rates delivery
```

## Real-Time Tracking

### Location Updates

Delivery personnel should update location every 30-60 seconds:

```javascript
// Update location periodically
setInterval(async () => {
    const position = await getCurrentPosition();
    await api.updateDeliveryLocation(bookingId, {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        address: await reverseGeocode(position.coords)
    });
}, 30000); // Every 30 seconds
```

### Distance Calculation

The delivery model includes a `calculateDistance` method:

```javascript
const delivery = await Delivery.findOne({ bookingId });
const distance = delivery.calculateDistance(
    customerLongitude,
    customerLatitude
);
console.log(`Distance: ${distance.toFixed(2)} km`);
```

## Admin Dashboard Metrics

### Key Performance Indicators (KPIs)

1. **User Growth**: New users vs total users
2. **Booking Rate**: Bookings per day/week/month
3. **Revenue**: Total and monthly revenue
4. **Delivery Success Rate**: Delivered / Total bookings
5. **Average Delivery Time**: Time from booking to delivery
6. **Customer Satisfaction**: Average delivery ratings

### Top Customers

Dashboard shows top 10 customers by:
- Total bookings
- Total amount spent

## Security & Authorization

### Role-Based Access

| Endpoint | Customer | Delivery | Admin |
|----------|----------|----------|-------|
| View own delivery | ✅ | ✅ | ✅ |
| Update location | ❌ | ✅ | ✅ |
| Update status | ❌ | ✅ | ✅ |
| Assign delivery | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Reports | ❌ | ❌ | ✅ |

## Best Practices

### For Delivery Personnel

1. **Update Location Regularly**: Every 30-60 seconds when in-transit
2. **Update Status Promptly**: Change status as soon as action is taken
3. **Capture Proof**: Always take photo and get signature
4. **Handle Failures**: Mark as failed with reason if unable to deliver

### For Admins

1. **Monitor Dashboard**: Check daily for pending assignments
2. **Assign Strategically**: Assign based on delivery person location
3. **Review Ratings**: Monitor delivery ratings and feedback
4. **Generate Reports**: Regular reports for business insights

### For Customers

1. **Track in Real-Time**: Use tracking page to see live location
2. **Be Available**: Ensure someone is available at delivery time
3. **Provide Feedback**: Rate delivery to help improve service

## Troubleshooting

### Delivery Not Showing

```
Issue: Delivery record not found
Solution: Delivery is auto-created with booking. Check booking exists.
```

### Location Not Updating

```
Issue: Location updates failing
Solution: Check GPS permissions and network connectivity
```

### Cannot Assign Delivery Person

```
Issue: User is not a delivery person
Solution: Update user role to 'delivery' first
```

## Future Enhancements

- [ ] Route optimization algorithm
- [ ] Estimated time of arrival (ETA) calculation
- [ ] Push notifications for location updates
- [ ] Delivery person performance analytics
- [ ] Customer delivery preferences
- [ ] Delivery scheduling
- [ ] Multi-stop route planning
