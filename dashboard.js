// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    checkAuthentication();

    // Load user data
    loadUserData();

    // Initialize navigation
    initializeNavigation();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize logout
    initializeLogout();
});

// Authentication Check
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// Load User Data
function loadUserData() {
    const userDataString = localStorage.getItem('gasAgencyUser');

    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);

            // Update user name in header
            const userNameElement = document.getElementById('userName');
            if (userNameElement && userData.name) {
                userNameElement.textContent = userData.name;
            }

            // Update welcome message
            const welcomeNameElement = document.getElementById('welcomeName');
            if (welcomeNameElement && userData.name) {
                welcomeNameElement.textContent = userData.name.split(' ')[0];
            }

            // Update user initials
            const userInitialsElement = document.getElementById('userInitials');
            if (userInitialsElement && userData.name) {
                const initials = getInitials(userData.name);
                userInitialsElement.textContent = initials;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Get Initials from Name
function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Get page name from data attribute
            const pageName = this.getAttribute('data-page');

            // Update page title
            updatePageTitle(pageName);

            // Show notification for non-home pages (since we only have home page content)
            if (pageName !== 'home') {
                showNotification(`${capitalizeFirst(pageName)} page - Coming soon!`, 'info');
            }
        });
    });
}

// Update Page Title
function updatePageTitle(pageName) {
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = capitalizeFirst(pageName);
    }
}

// Capitalize First Letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1024) {
            if (sidebar && !sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Logout
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            // Show confirmation
            if (confirm('Are you sure you want to logout?')) {
                // Clear user data
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('gasAgencyUser');

                // Show success message
                showNotification('Logged out successfully!', 'success');

                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');

    // Set colors based on type
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = 'linear-gradient(135deg, var(--success-600), var(--success-500))';
            break;
        case 'error':
            backgroundColor = 'linear-gradient(135deg, var(--danger-600), var(--danger-500))';
            break;
        case 'warning':
            backgroundColor = 'linear-gradient(135deg, var(--warning-600), var(--warning-500))';
            break;
        case 'info':
        default:
            backgroundColor = 'linear-gradient(135deg, var(--info-600), var(--info-500))';
            break;
    }

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-size: 0.875rem;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Quick Action Buttons
document.addEventListener('DOMContentLoaded', function () {
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {
        button.addEventListener('click', function () {
            const buttonText = this.querySelector('span').textContent;
            showNotification(`${buttonText} - Feature coming soon!`, 'info');
        });
    });
});

// Add animation styles if not already present
if (!document.getElementById('dashboard-animations')) {
    const style = document.createElement('style');
    style.id = 'dashboard-animations';
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
}
