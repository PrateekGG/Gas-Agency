# Gas Agency Management System

A modern, responsive gas agency management system with user authentication and dashboard functionality.

## Features

### 🔐 Authentication
- **Login Page** - Secure login with email and password validation
- **Signup Page** - User registration with comprehensive form validation
- **Password Toggle** - Show/hide password functionality
- **Form Validation** - Real-time validation with helpful error messages
- **LocalStorage Auth** - Simulated authentication using browser storage

### 📊 Dashboard
- **Home Page** - Welcome section with personalized greeting
- **Statistics Cards** - Visual display of key metrics:
  - Active Cylinders
  - Total Bookings
  - Pending Deliveries
  - Last Refill Information
- **Recent Activity** - Timeline of recent bookings and deliveries
- **Quick Actions** - Fast access to common tasks
- **Responsive Sidebar** - Collapsible navigation menu
- **User Profile** - Display user information and avatar

### 🎨 Design Features
- **Modern Dark Theme** - Sleek dark mode interface
- **Gradient Animations** - Floating gradient orbs on auth pages
- **Smooth Transitions** - Polished animations throughout
- **Glassmorphism** - Modern frosted glass effects
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Custom Color System** - Carefully curated color palette

## File Structure

```
GasAgency/
├── login.html          # Login page
├── signup.html         # Signup/registration page
├── dashboard.html      # Main dashboard
├── styles.css          # Complete CSS design system
├── auth.js            # Authentication logic
├── dashboard.js       # Dashboard functionality
└── README.md          # This file
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone or download** the project files to your computer

2. **Open the application**:
   - Simply open `login.html` in your web browser
   - Or right-click on `login.html` → Open with → Your preferred browser

### Usage

#### First Time Setup
1. Open `login.html` in your browser
2. Click "Sign up" to create an account
3. Fill in the registration form:
   - Full Name (minimum 3 characters)
   - Email Address (valid email format)
   - Phone Number (minimum 10 digits)
   - Password (minimum 8 characters, must contain letters and numbers)
   - Confirm Password
   - Accept Terms & Conditions
4. Click "Create Account"

#### Logging In
1. Open `login.html`
2. Enter your email and password
3. Optionally check "Remember me"
4. Click "Login"

#### Dashboard Navigation
- **Home** - View statistics and recent activity
- **Bookings** - Manage gas cylinder bookings (coming soon)
- **Cylinders** - Track your cylinders (coming soon)
- **Profile** - View and edit your profile (coming soon)
- **Logout** - Sign out of your account

## Features in Detail

### Form Validation
- **Email**: Validates proper email format
- **Password**: Minimum 8 characters, must contain letters and numbers
- **Phone**: Minimum 10 digits
- **Real-time Feedback**: Instant error messages for invalid inputs

### Responsive Breakpoints
- **Desktop**: Full sidebar navigation (> 1024px)
- **Tablet**: Collapsible sidebar (768px - 1024px)
- **Mobile**: Mobile-optimized layout (< 768px)

### Color Palette
- **Primary**: Blue tones for main actions
- **Success**: Green for positive actions
- **Warning**: Orange for alerts
- **Danger**: Red for errors
- **Info**: Cyan for information

## Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage API** - Data persistence
- **Google Fonts** - Inter font family

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-500: hsl(220, 75%, 55%);
    --success-500: hsl(142, 71%, 45%);
    /* ... more colors */
}
```

### Adding New Pages
1. Create a new HTML file
2. Link `styles.css` for styling
3. Add navigation item in `dashboard.html`
4. Update `dashboard.js` navigation logic

## Future Enhancements
- Backend integration with database
- Real booking system
- Payment gateway integration
- SMS/Email notifications
- Admin panel
- Delivery tracking
- Invoice generation
- Multi-language support

## Security Notes
⚠️ **Important**: This is a frontend-only demonstration. For production use:
- Implement proper backend authentication
- Use secure password hashing
- Add HTTPS encryption
- Implement CSRF protection
- Add rate limiting
- Use secure session management

## License
This project is open source and available for educational purposes.

## Support
For issues or questions, please refer to the documentation or contact support.

---

**Built with ❤️ for modern gas agency management**
