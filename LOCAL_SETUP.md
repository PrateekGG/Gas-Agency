# Local Setup Guide - Gas Agency Management System

Follow these steps to run the system on your local machine.

## Step 1: Install MongoDB (5 minutes)

### Windows

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Click: Download

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Service (check the box)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**
   ```bash
   mongod --version
   ```

### Alternative: MongoDB Atlas (Cloud - Free)

If you don't want to install MongoDB locally:

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free cluster (M0)
4. Get connection string
5. Use it in `.env` file

## Step 2: Setup Backend (2 minutes)

1. **Navigate to backend folder**
   ```bash
   cd C:\Users\Dell\GasAgency\backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   copy .env.example .env
   ```

4. **Edit .env file**
   
   Open `.env` in notepad and update:
   
   ```env
   # Minimum required for local testing
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gas-agency
   JWT_SECRET=my-super-secret-jwt-key-for-local-development-min-32-chars
   JWT_EXPIRE=7d
   FRONTEND_URL=http://127.0.0.1:5500
   
   # Optional - Add later for full features
   # RAZORPAY_KEY_ID=
   # RAZORPAY_KEY_SECRET=
   # EMAIL_USER=
   # EMAIL_PASSWORD=
   # TWILIO_ACCOUNT_SID=
   # TWILIO_AUTH_TOKEN=
   # TWILIO_PHONE_NUMBER=
   ```

5. **Start the backend**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✓ Server running on port 5000
   ✓ MongoDB connected successfully
   ```

## Step 3: Setup Frontend (1 minute)

1. **Open frontend folder**
   ```bash
   cd C:\Users\Dell\GasAgency
   ```

2. **Open with Live Server**
   
   **Option A: VS Code Live Server**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   
   **Option B: Manual**
   - Just open `index.html` in your browser
   - URL will be: `file:///C:/Users/Dell/GasAgency/index.html`

## Step 4: Test the System (5 minutes)

### Test 1: Backend Health Check

Open browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Test 2: Register a User

1. Open `signup.html` in browser
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +919876543210
   - Password: Test@123
3. Click "Sign Up"

### Test 3: Login

1. Open `login.html`
2. Enter:
   - Email: test@example.com
   - Password: Test@123
3. Click "Login"

### Test 4: Create a Booking (Using Console)

1. Open browser console (F12)
2. Run:

```javascript
// Create a booking
const booking = await api.createBooking({
    cylinderType: '14.2kg',
    quantity: 1,
    deliveryAddress: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
    },
    scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
});

console.log('Booking created:', booking);
```

### Test 5: View Bookings

```javascript
const bookings = await api.getMyBookings();
console.log('My bookings:', bookings);
```

## Common Issues & Solutions

### Issue 1: MongoDB Not Running

**Error:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or run manually
mongod
```

### Issue 2: Port 5000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in .env
PORT=5001
```

### Issue 3: npm install fails

**Error:**
```
cannot be loaded because running scripts is disabled
```

**Solution:**
```bash
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 4: CORS Error

**Error:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Restart backend server after changing `.env`

## Quick Commands Reference

### Backend Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Check for errors
npm run lint
```

### MongoDB Commands

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Stop MongoDB service (Windows)
net stop MongoDB

# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use gas-agency database
use gas-agency

# Show collections
show collections

# View users
db.users.find().pretty()

# View bookings
db.bookings.find().pretty()
```

## Testing with Postman (Optional)

1. **Download Postman**
   - https://www.postman.com/downloads/

2. **Test Register**
   ```
   POST http://localhost:5000/api/auth/register
   Headers: Content-Type: application/json
   Body:
   {
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+919876543210",
       "password": "Test@123"
   }
   ```

3. **Test Login**
   ```
   POST http://localhost:5000/api/auth/login
   Headers: Content-Type: application/json
   Body:
   {
       "email": "test@example.com",
       "password": "Test@123"
   }
   ```

4. **Copy the token from response**

5. **Test Create Booking**
   ```
   POST http://localhost:5000/api/bookings
   Headers: 
     Content-Type: application/json
     Authorization: Bearer YOUR_TOKEN_HERE
   Body:
   {
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

## Create Admin User

1. **Register a normal user** (via signup page)

2. **Open MongoDB Compass** or **mongosh**

3. **Update user role to admin:**

   **Using MongoDB Compass:**
   - Connect to `mongodb://localhost:27017`
   - Select `gas-agency` database
   - Select `users` collection
   - Find your user
   - Edit document
   - Change `role` from `"customer"` to `"admin"`
   - Save

   **Using mongosh:**
   ```javascript
   use gas-agency
   db.users.updateOne(
       { email: "test@example.com" },
       { $set: { role: "admin" } }
   )
   ```

4. **Login again** to get new token with admin privileges

## What Works Without External Services

### ✅ Works Locally (No external setup needed)
- User registration and login
- Creating bookings
- Viewing bookings
- Updating bookings
- Canceling bookings
- Cylinder management
- Delivery tracking
- Invoice generation
- Customer profiles
- Admin dashboard

### ⚠️ Requires External Setup
- **Payments**: Need Razorpay account
- **Email notifications**: Need Gmail app password
- **SMS notifications**: Need Twilio account

## Next Steps

1. **Test all features** without payments/notifications
2. **Set up Razorpay** (optional - for payments)
3. **Set up Gmail** (optional - for emails)
4. **Set up Twilio** (optional - for SMS)
5. **Customize** the system for your needs

## File Structure

```
GasAgency/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Booking.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   └── ...
│   ├── .env (create this)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── api.js
├── index.html
├── login.html
├── signup.html
└── dashboard.html
```

## Useful URLs

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Frontend**: http://127.0.0.1:5500 (with Live Server)
- **MongoDB Compass**: mongodb://localhost:27017

## Getting Help

If you encounter issues:

1. Check the error message in terminal
2. Check browser console (F12)
3. Verify MongoDB is running
4. Check `.env` file is configured
5. Restart backend server
6. Clear browser cache/localStorage

## You're Ready! 🎉

Your local development environment is set up!

**Start developing:**
1. Backend is running on port 5000
2. Frontend is accessible via browser
3. MongoDB is storing your data
4. All APIs are ready to use

**Test the complete flow:**
1. Register → Login → Create Booking → View Bookings

Enjoy building! 🚀
