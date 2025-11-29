# Gas Agency Backend - Setup Instructions

## Quick Start Guide

### Step 1: Install Dependencies

Open PowerShell as Administrator and run:

```powershell
# Navigate to backend directory
cd C:\Users\Dell\GasAgency\backend

# Install dependencies
npm install
```

If you get a PowerShell execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the `backend` folder with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gas-agency

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=gas-agency-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://127.0.0.1:5500

# Email Configuration (Optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Install MongoDB

**Option A - MongoDB Compass (Recommended for beginners)**:
1. Download from: https://www.mongodb.com/try/download/compass
2. Install and run MongoDB Compass
3. It will automatically start a local MongoDB instance
4. Connection string: `mongodb://localhost:27017/gas-agency`

**Option B - MongoDB Atlas (Cloud - Free)**:
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```powershell
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Gas Agency Management System API                ║
║                                                       ║
║   Server running in development mode                 ║
║   Port: 5000                                         ║
║   URL: http://localhost:5000                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
✅ MongoDB Connected: localhost
```

### Step 5: Test the API

Open a new PowerShell window and test:

```powershell
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"1234567890\",\"password\":\"password123\"}'
```

## Troubleshooting

### "npm is not recognized"
- Install Node.js from: https://nodejs.org/
- Restart PowerShell after installation

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check connection string in `.env`
- Try MongoDB Compass for easier setup

### Port 5000 already in use
- Change PORT in `.env` to 5001 or another port
- Update FRONTEND_URL accordingly

## Next Steps

Once the backend is running:
1. Update frontend files to use the API
2. Test registration and login
3. Proceed with Phase 2 features
