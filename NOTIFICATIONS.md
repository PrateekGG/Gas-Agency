# Notification System Documentation

Complete guide for email and SMS notifications.

## Services

### Email Service (Nodemailer)
- **Provider**: Gmail SMTP / Any SMTP server
- **Templates**: Beautiful HTML email templates
- **Features**: Booking confirmations, delivery updates, payment receipts, password reset, welcome emails

### SMS Service (Twilio)
- **Provider**: Twilio
- **Features**: Booking confirmations, delivery updates, payment confirmations, OTP, reminders

## Setup

### Email Configuration

Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=GasFlow <noreply@gasflow.com>
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `EMAIL_PASSWORD`

### SMS Configuration

Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Get Twilio Credentials:**
1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token from dashboard
3. Get a phone number

## Notification Types

### 1. Booking Confirmation
**Trigger**: When booking is created  
**Channels**: Email + SMS  
**Template**: Booking details with tracking link

### 2. Delivery Update
**Trigger**: When delivery status changes  
**Channels**: Email + SMS  
**Statuses**: assigned, picked-up, in-transit, nearby, delivered

### 3. Payment Receipt
**Trigger**: When payment is completed  
**Channels**: Email + SMS  
**Template**: Payment details with invoice number

### 4. Welcome Email
**Trigger**: User registration  
**Channels**: Email only  
**Template**: Welcome message with features

### 5. Password Reset
**Trigger**: Forgot password request  
**Channels**: Email only  
**Template**: Reset link with expiry

### 6. Delivery Reminder
**Trigger**: Manual/Scheduled  
**Channels**: SMS only  
**Template**: Reminder for scheduled delivery

### 7. Refund Notification
**Trigger**: Refund processed  
**Channels**: SMS only  
**Template**: Refund confirmation

## API Usage

### Test Notification (Admin)

```http
POST /api/notifications/test
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "booking_confirmation",
  "email": "test@example.com",
  "phone": "+919876543210"
}
```

**Available Types:**
- `booking_confirmation`
- `delivery_update`
- `payment_receipt`
- `welcome`
- `password_reset`
- `delivery_reminder`
- `refund_notification`

### Programmatic Usage

```javascript
const { sendNotification } = require('./controllers/notificationController');

// Send booking confirmation
await sendNotification('booking_confirmation', {
    user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543210'
    },
    booking: {
        bookingNumber: 'BK17012345670001',
        cylinderType: '14.2kg',
        quantity: 2,
        amount: 1800,
        scheduledDate: new Date(),
        status: 'confirmed'
    }
});
```

## Email Templates

All email templates include:
- Responsive design
- Beautiful gradients
- Clear call-to-action buttons
- Professional branding
- Mobile-friendly layout

### Template Colors
- **Primary**: #3B82F6 (Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)
- **Danger**: #EF4444 (Red)
- **Info**: #8B5CF6 (Purple)

## SMS Templates

SMS messages are concise and include:
- Brand name (GasFlow)
- Key information
- Tracking link (when applicable)
- Contact details (for delivery)

**Character Limit**: 160 characters per SMS

## Integration Points

### Booking Controller
```javascript
// After creating booking
await sendNotification('booking_confirmation', {
    user: booking.userId,
    booking
});
```

### Payment Controller
```javascript
// After payment verification
await sendNotification('payment_receipt', {
    user,
    booking,
    payment,
    invoice
});
```

### Auth Controller
```javascript
// After user registration
await sendNotification('welcome', { user });
```

### Delivery Updates
```javascript
// When delivery status changes
await sendNotification('delivery_update', {
    user,
    booking,
    delivery
});
```

## Error Handling

Notifications are non-blocking:
- Errors are logged but don't stop the main flow
- Failed notifications return `{ success: false, error }`
- System continues even if notification fails

## Testing

### Test Email

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking_confirmation",
    "email": "test@example.com"
  }'
```

### Test SMS

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking_confirmation",
    "phone": "+919876543210"
  }'
```

## Production Checklist

- [ ] Configure production SMTP server
- [ ] Set up Twilio production account
- [ ] Verify sender email domain
- [ ] Test all notification types
- [ ] Set up email tracking (optional)
- [ ] Configure SMS delivery reports
- [ ] Add unsubscribe links (email)
- [ ] Implement notification preferences
- [ ] Set up notification logs
- [ ] Monitor delivery rates

## Cost Optimization

### Email
- Use transactional email service (SendGrid, Mailgun)
- Free tier: 100 emails/day (Gmail)
- Paid: $0.001 per email

### SMS
- Twilio pricing: ~$0.0075 per SMS
- Use SMS only for critical updates
- Prefer email for detailed information

## Best Practices

1. **Personalization**: Always use user's name
2. **Clear Subject**: Descriptive email subjects
3. **Mobile-First**: Responsive email templates
4. **Timing**: Send notifications immediately
5. **Opt-Out**: Provide unsubscribe option
6. **Testing**: Test before production
7. **Monitoring**: Track delivery rates
8. **Fallback**: Have backup notification method

## Troubleshooting

### Email Not Sending

```
Error: Invalid login
Solution: Check EMAIL_USER and EMAIL_PASSWORD
```

### Gmail Blocking

```
Error: Less secure app access
Solution: Use App Password instead of account password
```

### SMS Not Sending

```
Error: Invalid phone number
Solution: Use E.164 format (+919876543210)
```

### Twilio Trial Limitations

```
Error: Unverified number
Solution: Verify recipient numbers in Twilio console
```

## Future Enhancements

- [ ] Push notifications (FCM)
- [ ] WhatsApp notifications
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Scheduled notifications
- [ ] Notification templates editor
- [ ] A/B testing for emails
- [ ] Analytics dashboard
