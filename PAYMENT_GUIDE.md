# Payment Integration Guide

Complete guide for integrating Razorpay payment gateway.

## Setup

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Add to `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

### 2. Install Dependencies

Already included in `package.json`:
```bash
npm install razorpay
```

## Payment Flow

### Complete Payment Process

```
1. User creates booking
2. Frontend requests payment order
3. Backend creates Razorpay order
4. Frontend shows Razorpay checkout
5. User completes payment
6. Razorpay sends response
7. Frontend sends to backend for verification
8. Backend verifies signature
9. Payment marked as completed
10. Booking confirmed
11. Invoice generated
```

## API Endpoints

### 1. Create Payment Order

```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "order": {
    "id": "order_xxxxxxxxxxxxx",
    "amount": 180000,
    "currency": "INR",
    "receipt": "booking_BK17012345670001"
  },
  "payment": {
    "id": "payment_db_id",
    "transactionId": "TXN1701234567ABC"
  },
  "razorpayKeyId": "rzp_test_xxxxxxxxxxxxx"
}
```

### 2. Verify Payment

```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_xxxxxxxxxxxxx",
  "paymentId": "pay_xxxxxxxxxxxxx",
  "signature": "signature_here",
  "paymentDbId": "payment_db_id"
}
```

### 3. Get Payment Details

```http
GET /api/payments/:id
Authorization: Bearer <token>
```

### 4. Get Payment History

```http
GET /api/payments/history?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

### 5. Process Refund (Admin)

```http
POST /api/payments/:id/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "amount": 1800,
  "reason": "Customer requested cancellation"
}
```

### 6. Get Refund Status

```http
GET /api/payments/:id/refund-status
Authorization: Bearer <token>
```

### 7. Record Cash Payment (Delivery/Admin)

```http
POST /api/payments/cash
Authorization: Bearer <delivery_token>
Content-Type: application/json

{
  "bookingId": "booking_id_here",
  "amount": 1800
}
```

## Frontend Integration

### HTML

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### JavaScript

```javascript
async function initiatePayment(bookingId) {
    try {
        // Step 1: Create order
        const response = await api.createPaymentOrder({ bookingId });
        
        const options = {
            key: response.razorpayKeyId,
            amount: response.order.amount,
            currency: response.order.currency,
            name: 'GasFlow',
            description: 'Gas Cylinder Booking',
            order_id: response.order.id,
            handler: async function(razorpayResponse) {
                // Step 2: Verify payment
                try {
                    const verifyResponse = await api.verifyPayment({
                        orderId: razorpayResponse.razorpay_order_id,
                        paymentId: razorpayResponse.razorpay_payment_id,
                        signature: razorpayResponse.razorpay_signature,
                        paymentDbId: response.payment.id
                    });
                    
                    alert('Payment successful!');
                    window.location.href = '/dashboard.html';
                } catch (error) {
                    alert('Payment verification failed!');
                }
            },
            prefill: {
                name: userData.name,
                email: userData.email,
                contact: userData.phone
            },
            theme: {
                color: '#3B82F6'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        alert('Error initiating payment');
    }
}
```

## Testing

### Test Cards

Razorpay provides test cards for testing:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002

### Test UPI

- UPI ID: success@razorpay
- For failure: failure@razorpay

### Test Netbanking

- Select any bank
- Use credentials provided on test page

## Webhook Integration (Optional)

For production, set up webhooks:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events:
   - payment.authorized
   - payment.failed
   - refund.processed

### Webhook Handler

```javascript
router.post('/webhook', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        secret
    );
    
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const payload = req.body.payload;
    
    // Handle different events
    switch(event) {
        case 'payment.authorized':
            // Handle authorized payment
            break;
        case 'payment.failed':
            // Handle failed payment
            break;
        case 'refund.processed':
            // Handle refund
            break;
    }
    
    res.json({ status: 'ok' });
});
```

## Error Handling

Common errors and solutions:

### Invalid Key ID
```
Error: Invalid key_id
Solution: Check RAZORPAY_KEY_ID in .env
```

### Signature Verification Failed
```
Error: Invalid signature
Solution: Check RAZORPAY_KEY_SECRET in .env
```

### Payment Already Exists
```
Error: Payment already exists for this booking
Solution: Check if booking already has a completed payment
```

## Security Best Practices

1. **Never expose secret key** - Keep in `.env`, never commit
2. **Always verify signature** - Don't trust client-side data
3. **Use HTTPS** - Required for production
4. **Validate amounts** - Check amount matches booking
5. **Log all transactions** - Keep audit trail
6. **Handle webhooks** - For production reliability

## Amount Calculation

Razorpay uses **paise** (smallest currency unit):

```javascript
// Convert rupees to paise
const amountInPaise = amountInRupees * 100;

// Convert paise to rupees
const amountInRupees = amountInPaise / 100;
```

## Refund Policy

- Full refund: Before delivery
- Partial refund: Based on policy
- Processing time: 5-7 business days
- Refund to original payment method

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoint
- [ ] Configure webhook secret
- [ ] Test with real small amounts
- [ ] Set up payment reconciliation
- [ ] Configure auto-capture settings
- [ ] Set up email notifications
- [ ] Add payment retry logic
- [ ] Implement payment timeout handling
- [ ] Set up monitoring and alerts

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com/
