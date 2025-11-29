# Booking & Cylinder API Documentation

Complete API documentation for booking and cylinder management.

## Booking Endpoints

### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "cylinderType": "14.2kg",
  "quantity": 2,
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Gateway"
  },
  "scheduledDate": "2024-12-01",
  "notes": "Please call before delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "...",
    "bookingNumber": "BK17012345670001",
    "userId": {...},
    "cylinderType": "14.2kg",
    "quantity": 2,
    "amount": 1800,
    "status": "pending",
    ...
  }
}
```

### Get My Bookings
```http
GET /api/bookings?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Get Single Booking
```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

### Update Booking
```http
PUT /api/bookings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryAddress": {
    "street": "456 New St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002"
  },
  "scheduledDate": "2024-12-02"
}
```

### Update Booking Status (Admin/Delivery)
```http
PUT /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending`
- `confirmed`
- `processing`
- `out-for-delivery`
- `delivered`
- `cancelled`

### Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

### Get Booking History
```http
GET /api/bookings/history
Authorization: Bearer <token>
```

### Get All Bookings (Admin)
```http
GET /api/bookings/admin/all?status=pending&page=1&limit=20&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

## Cylinder Endpoints

### Get My Cylinders
```http
GET /api/cylinders
Authorization: Bearer <token>
```

### Get Single Cylinder
```http
GET /api/cylinders/:id
Authorization: Bearer <token>
```

### Create Cylinder (Admin)
```http
POST /api/cylinders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "type": "14.2kg",
  "serialNumber": "CYL123456",
  "securityDeposit": 500
}
```

### Update Cylinder Status (Admin/Delivery)
```http
PUT /api/cylinders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active"
}
```

**Valid Statuses:**
- `active`
- `empty`
- `maintenance`
- `returned`

### Add to Cylinder History (Admin/Delivery)
```http
POST /api/cylinders/:id/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking_id_here",
  "action": "refilled"
}
```

**Valid Actions:**
- `delivered`
- `refilled`
- `returned`
- `maintenance`

### Get Due Cylinders
```http
GET /api/cylinders/due
Authorization: Bearer <token>
```

### Return Cylinder
```http
PUT /api/cylinders/:id/return
Authorization: Bearer <token>
```

## Pricing

| Cylinder Type | Price (INR) |
|---------------|-------------|
| 14.2kg        | ₹900        |
| 19kg          | ₹1,200      |
| 5kg           | ₹450        |

## Status Flow

### Booking Status Flow
```
pending → confirmed → processing → out-for-delivery → delivered
                                                    ↓
                                                cancelled
```

### Cylinder Status Flow
```
active → empty → maintenance → active
                            ↓
                        returned
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Examples

### Complete Booking Flow

1. **Create Booking**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cylinderType": "14.2kg",
    "quantity": 1,
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "scheduledDate": "2024-12-01"
  }'
```

2. **Check Booking Status**
```bash
curl http://localhost:5000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Update Booking (if needed)**
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledDate": "2024-12-02"
  }'
```

4. **Cancel Booking (if needed)**
```bash
curl -X DELETE http://localhost:5000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "No longer needed"}'
```

### Check Cylinders Due for Refill

```bash
curl http://localhost:5000/api/cylinders/due \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin: View All Bookings

```bash
curl "http://localhost:5000/api/bookings/admin/all?status=pending&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- All dates should be in ISO 8601 format
- Booking numbers are auto-generated
- Cylinder IDs are auto-generated
- Delivery records are created automatically with bookings
- Cylinders are marked due for refill after 90 days
- Only pending/confirmed bookings can be updated or cancelled
- Admin and delivery personnel have additional permissions
