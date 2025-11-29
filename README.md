# Gas Agency Backend API

Backend API for the Gas Agency Management System built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Error handling middleware
- ✅ MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

   ```bash
   cp .env.example .env
   ```

4. **Set up MongoDB**:
   - **Option 1 - Local MongoDB**:
     - Install MongoDB locally
     - Start MongoDB service
     - Use connection string: `mongodb://localhost:27017/gas-agency`
   
   - **Option 2 - MongoDB Atlas** (Recommended):
     - Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
     - Create a free cluster
     - Get connection string
     - Update `MONGODB_URI` in `.env`

## Configuration

Edit the `.env` file with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gas-agency

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password/:resetToken
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js             # JWT verification
│   └── errorHandler.js     # Error handling
├── models/
│   └── User.js             # User schema
├── routes/
│   └── auth.js             # Auth routes
├── .env.example            # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"1234567890","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables
3. Test each endpoint

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **JWT**: Secure token-based authentication
- **Bcrypt**: Password hashing
- **Input Validation**: Mongoose schema validation

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## Success Responses

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | Token expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

### Port Already in Use
- Change PORT in `.env`
- Kill process using port 5000

### JWT Errors
- Verify JWT_SECRET is set
- Check token format in Authorization header

## Next Steps

- [ ] Implement booking system
- [ ] Add payment integration
- [ ] Set up email/SMS notifications
- [ ] Create admin panel APIs
- [ ] Add delivery tracking
- [ ] Implement invoice generation

## License

MIT
