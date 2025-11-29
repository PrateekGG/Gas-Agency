# Deployment Guide - Gas Agency Management System

Complete guide for deploying the Gas Agency Management System to production.

## Prerequisites

- Node.js 14+ installed
- MongoDB Atlas account (or local MongoDB)
- Razorpay account
- Gmail account (for emails)
- Twilio account (for SMS)
- Git installed

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Create New Project on Railway**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the backend folder

4. **Add Environment Variables**
   Go to Variables tab and add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRE=7d
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   EMAIL_FROM=GasFlow <noreply@gasflow.com>
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Deploy**
   - Railway will auto-deploy
   - Get your backend URL: `https://your-app.railway.app`

### Option 2: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select backend folder

3. **Configure Service**
   - Name: `gas-agency-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. **Add Environment Variables**
   - Same as Railway above

5. **Deploy**
   - Click "Create Web Service"
   - Get URL: `https://gas-agency-backend.onrender.com`

### Option 3: Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # ... add all other env vars
   ```

## Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Update API URL**
   - Open `api.js`
   - Change `baseURL` to your backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend.railway.app/api';
   ```

3. **Deploy**
   ```bash
   cd GasAgency
   vercel
   ```

4. **Configure**
   - Project name: `gas-agency`
   - Framework: None (static site)
   - Build command: (leave empty)
   - Output directory: `./`

5. **Get URL**
   - Production URL: `https://gas-agency.vercel.app`

### Netlify

1. **Create `netlify.toml`**
   ```toml
   [build]
     publish = "."
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## MongoDB Atlas Setup

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Choose Free tier (M0)
   - Select region closest to your users
   - Cluster name: `GasAgency`

3. **Create Database User**
   - Database Access → Add New User
   - Username: `gasagency`
   - Password: Generate secure password
   - Role: Read and write to any database

4. **Whitelist IP**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (For production, use specific IPs)

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://gasagency:<password>@cluster0.xxxxx.mongodb.net/gas-agency?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your password

## Razorpay Setup

1. **Create Account**
   - Go to [razorpay.com](https://razorpay.com)
   - Sign up and complete KYC

2. **Get API Keys**
   - Settings → API Keys
   - Generate Test Keys (for testing)
   - Generate Live Keys (for production)

3. **Configure Webhook** (Optional)
   - Settings → Webhooks
   - URL: `https://your-backend-url/api/payments/webhook`
   - Events: payment.authorized, payment.failed, refund.processed

## Email Setup (Gmail)

1. **Enable 2FA**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password**
   - Security → App passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Name: GasFlow
   - Copy the 16-character password

3. **Use in Environment**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

## Twilio Setup

1. **Create Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for free trial

2. **Get Credentials**
   - Console Dashboard
   - Account SID
   - Auth Token

3. **Get Phone Number**
   - Phone Numbers → Buy a number
   - Choose a number with SMS capability

4. **Verify Numbers** (Trial)
   - For trial accounts, verify recipient numbers
   - Phone Numbers → Verified Caller IDs

## Environment Variables Checklist

### Backend
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI` (MongoDB Atlas)
- [ ] `JWT_SECRET` (min 32 characters)
- [ ] `JWT_EXPIRE=7d`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD` (App password)
- [ ] `EMAIL_FROM`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `FRONTEND_URL` (Your Vercel URL)

### Frontend
- [ ] Update `API_BASE_URL` in `api.js`

## Testing Deployment

### Backend Health Check

```bash
curl https://your-backend-url/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Test Registration

```bash
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "Test@123"
  }'
```

### Test Login

```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

## Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 chars)
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Review MongoDB IP whitelist

### Functionality
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking creation
- [ ] Test payment flow
- [ ] Test email notifications
- [ ] Test SMS notifications
- [ ] Test admin panel
- [ ] Test delivery tracking

### Monitoring
- [ ] Set up error logging (Sentry)
- [ ] Monitor API response times
- [ ] Track database performance
- [ ] Monitor payment success rate
- [ ] Set up uptime monitoring

## Custom Domain Setup

### Backend (Railway)

1. **Add Custom Domain**
   - Settings → Domains
   - Add domain: `api.yourdomain.com`

2. **Update DNS**
   - Add CNAME record:
   ```
   api.yourdomain.com → your-app.railway.app
   ```

### Frontend (Vercel)

1. **Add Custom Domain**
   - Project Settings → Domains
   - Add domain: `yourdomain.com`

2. **Update DNS**
   - Add A record:
   ```
   @ → 76.76.21.21
   ```
   - Add CNAME record:
   ```
   www → cname.vercel-dns.com
   ```

## SSL/HTTPS

- Railway: Automatic SSL
- Render: Automatic SSL
- Vercel: Automatic SSL
- Netlify: Automatic SSL

All platforms provide free SSL certificates automatically!

## Backup Strategy

### Database Backup

1. **MongoDB Atlas Automated Backups**
   - Clusters → Backup
   - Enable Cloud Backup
   - Configure retention period

2. **Manual Backup**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

### Code Backup

- Use Git for version control
- Push to GitHub/GitLab
- Tag releases: `git tag v1.0.0`

## Scaling Considerations

### Database
- Upgrade MongoDB cluster tier
- Add read replicas
- Enable sharding for large datasets

### Backend
- Horizontal scaling (multiple instances)
- Load balancer
- Caching (Redis)
- CDN for static assets

### Frontend
- CDN (automatic with Vercel/Netlify)
- Image optimization
- Code splitting
- Lazy loading

## Troubleshooting

### Backend Not Starting

```
Error: Cannot connect to MongoDB
Solution: Check MONGODB_URI is correct
```

### CORS Errors

```
Error: CORS policy blocked
Solution: Add frontend URL to CORS whitelist in server.js
```

### Payment Failures

```
Error: Invalid Razorpay key
Solution: Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
```

### Email Not Sending

```
Error: Invalid login
Solution: Use Gmail App Password, not account password
```

### SMS Not Sending

```
Error: Unverified number
Solution: Verify recipient numbers in Twilio console (trial)
```

## Monitoring Tools

### Free Options
- **Uptime**: UptimeRobot
- **Errors**: Sentry
- **Analytics**: Google Analytics
- **Logs**: Railway/Render built-in logs

### Paid Options
- **APM**: New Relic, Datadog
- **Logs**: Loggly, Papertrail
- **Monitoring**: Pingdom

## Cost Estimates

### Free Tier (Development)
- MongoDB Atlas: Free (M0 cluster)
- Railway: $5/month credit
- Vercel: Free (hobby plan)
- Razorpay: No monthly fee
- Gmail: Free
- Twilio: $15 trial credit

### Production (Small Scale)
- MongoDB Atlas: $9/month (M2)
- Railway: ~$10-20/month
- Vercel: Free (hobby) or $20/month (pro)
- Razorpay: 2% per transaction
- Gmail: Free
- Twilio: ~$0.0075 per SMS

## Support

- Backend Issues: Check Railway/Render logs
- Database Issues: MongoDB Atlas monitoring
- Payment Issues: Razorpay dashboard
- Email Issues: Gmail account settings
- SMS Issues: Twilio console

## Next Steps After Deployment

1. **Create Admin User**
   - Register a user
   - Manually update role to 'admin' in database

2. **Add Initial Data**
   - Add cylinder types
   - Set up pricing
   - Configure delivery areas

3. **Test Complete Flow**
   - User registration → Booking → Payment → Delivery

4. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Track user activity

5. **Gather Feedback**
   - Beta testing
   - User feedback
   - Bug reports

## Production Checklist

- [ ] All environment variables set
- [ ] MongoDB Atlas configured
- [ ] Razorpay live keys added
- [ ] Email sending working
- [ ] SMS sending working
- [ ] HTTPS enabled
- [ ] Custom domain configured
- [ ] Backups enabled
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Admin user created
- [ ] Complete flow tested
- [ ] Documentation updated

## Congratulations! 🎉

Your Gas Agency Management System is now live and ready for users!
