// Authentication JavaScript for Login and Signup Pages

// Password Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon (optional - you can add different SVG for eye-slash)
            this.classList.toggle('active');
        });
    });

    // Login Form Validation and Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            let isValid = true;
            
            // Email validation
            if (!email) {
                showError('emailError', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Password validation
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError('passwordError', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Store user data in localStorage (simulated authentication)
                const userData = {
                    email: email,
                    name: email.split('@')[0],
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('gasAgencyUser', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Show success message
                showSuccessMessage('Login successful! Redirecting...');
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        });
    }

    // Signup Form Validation and Submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            let isValid = true;
            
            // Full name validation
            if (!fullName) {
                showError('nameError', 'Full name is required');
                isValid = false;
            } else if (fullName.length < 3) {
                showError('nameError', 'Name must be at least 3 characters');
                isValid = false;
            }
            
            // Email validation
            if (!email) {
                showError('emailError', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Phone validation
            if (!phone) {
                showError('phoneError', 'Phone number is required');
                isValid = false;
            } else if (!isValidPhone(phone)) {
                showError('phoneError', 'Please enter a valid phone number');
                isValid = false;
            }
            
            // Password validation
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            } else if (password.length < 8) {
                showError('passwordError', 'Password must be at least 8 characters');
                isValid = false;
            } else if (!isStrongPassword(password)) {
                showError('passwordError', 'Password must contain letters and numbers');
                isValid = false;
            }
            
            // Confirm password validation
            if (!confirmPassword) {
                showError('confirmPasswordError', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }
            
            // Terms validation
            if (!terms) {
                alert('Please accept the Terms & Conditions');
                isValid = false;
            }
            
            if (isValid) {
                // Store user data in localStorage (simulated registration)
                const userData = {
                    name: fullName,
                    email: email,
                    phone: phone,
                    registrationTime: new Date().toISOString()
                };
                
                localStorage.setItem('gasAgencyUser', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Show success message
                showSuccessMessage('Account created successfully! Redirecting...');
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }
});

// Validation Helper Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function isStrongPassword(password) {
    // Check if password contains at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add error styling to input
        const input = errorElement.previousElementSibling.querySelector('input');
        if (input) {
            input.style.borderColor = 'var(--danger-500)';
        }
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    
    // Reset input border colors
    const inputs = document.querySelectorAll('.input-wrapper input');
    inputs.forEach(input => {
        input.style.borderColor = 'var(--border)';
    });
}

function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--success-600), var(--success-500));
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
