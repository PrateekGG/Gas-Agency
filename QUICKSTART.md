# Quick Start Guide - Gas Agency Management System

Get your Gas Agency Management System up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Required for basic functionality
MONGODB_URI=mongodb://localhost:27017/gas-agency
JWT_SECRET=your-super-secret-key-min-32-characters-long
FRONTEND_URL=http://127.0.0.1:5500

# Optional (for full features)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Start MongoDB

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud):
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Start Backend

```bash
npm run dev
```

You should see:
```
✓ Server running on port 5000
✓ MongoDB connected successfully
```

### 5. Open Frontend

Open `index.html` in your browser or use Live Server:

```bash
# If you have Live Server installed
live-server
```

## ✅ Test the System

### 1. Register a User

- Go to `signup.html`
- Fill in the form
- Click "Sign Up"
- You should receive a welcome email (if configured)

### 2. Login

- Go to `login.html`
- Enter your credentials
- Click "Login"
- You'll be redirected to dashboard

### 3. Create a Booking

Open browser console and run:

```javascript
const booking = await api.createBooking({
    cylinderType: '14.2kg',
    quantity: 1,
    deliveryAddress: {
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
    },
    scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
});
console.log('Booking created:', booking);
```

### 4. View Your Bookings

```javascript
const bookings = await api.getMyBookings();
console.log('My bookings:', bookings);
```

## 🎯 Common Tasks

### Create Admin User

1. Register a normal user
2. Open MongoDB Compass or shell
3. Find the user in `users` collection
4. Update `role` field to `'admin'`

```javascript
// In MongoDB shell
db.users.updateOne(
    { email: 'admin@example.com' },
    { $set: { role: 'admin' } }
)
```

### Test Payment Flow

1. Get Razorpay test keys from [razorpay.com](https://razorpay.com)
2. Add to `.env`
3. Create a booking
4. Create payment order:

```javascript
const order = await api.createPaymentOrder(bookingId);
console.log('Payment order:', order);
```

### Test Notifications

1. Configure email (Gmail app password)
2. Configure SMS (Twilio credentials)
3. Test:

```javascript
// As admin
await api.testNotification('booking_confirmation', 'test@example.com', '+919876543210');
```

## 📱 API Testing with Postman

### Import Collection

1. Open Postman
2. Import → Link
3. Use: `https://www.postman.com/collections/your-collection-id`

### Test Endpoints

**Register:**
```
POST http://localhost:5000/api/auth/register
Body: {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "Test@123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body: {
    "email": "test@example.com",
    "password": "Test@123"
}
```

**Create Booking:**
```
POST http://localhost:5000/api/bookings
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
    "cylinderType": "14.2kg",
    "quantity": 1,
    "deliveryAddress": {
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
    },
    "scheduledDate": "2024-12-01"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/gas-agency`

### CORS Error

```
Access to fetch blocked by CORS policy
```

**Solution:**
- Update `FRONTEND_URL` in `.env`
- Restart backend server

### Token Invalid

```
Error: Not authorized to access this route
```

**Solution:**
- Login again to get new token
- Check token in localStorage
- Make sure `Authorization` header is set

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Kill process using port 5000
- Or change `PORT` in `.env`

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

## 📚 Next Steps

1. **Explore the API**
   - Check [API_DOCS.md](file:///C:/Users/Dell/GasAgency/backend/API_DOCS.md)
   - Test all endpoints
   - Understand the flow

2. **Customize**
   - Update pricing in booking controller
   - Modify email templates
   - Add your branding

3. **Deploy**
   - Follow [DEPLOYMENT.md](file:///C:/Users/Dell/GasAgency/backend/DEPLOYMENT.md)
   - Deploy to Railway/Render
   - Configure production environment

4. **Integrate Frontend**
   - Update `api.js` with backend URL
   - Implement booking flow in UI
   - Add payment integration
   - Create admin dashboard

## 🎉 You're All Set!

Your Gas Agency Management System is ready to use!

**Useful Links:**
- [Complete Documentation](file:///C:/Users/Dell/GasAgency/backend/README.md)
- [Database Models](file:///C:/Users/Dell/GasAgency/backend/MODELS.md)
- [Payment Guide](file:///C:/Users/Dell/GasAgency/backend/PAYMENT_GUIDE.md)
- [Admin Guide](file:///C:/Users/Dell/GasAgency/backend/ADMIN_DELIVERY_GUIDE.md)

**Need Help?**
- Check the documentation
- Review error logs
- Test with Postman
- Verify environment variables
