// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Client Class
class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ENDPOINTS ====================

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, password) {
        return this.request(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ password })
        });
    }

    async logout() {
        const data = await this.request('/auth/logout', { method: 'POST' });
        this.removeToken();
        return data;
    }

    // ==================== BOOKING ENDPOINTS ====================

    async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    async getMyBookings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/bookings?${query}`);
    }

    async getBooking(id) {
        return this.request(`/bookings/${id}`);
    }

    async updateBooking(id, updates) {
        return this.request(`/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async cancelBooking(id, reason) {
        return this.request(`/bookings/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ reason })
        });
    }

    async getBookingHistory() {
        return this.request('/bookings/history');
    }

    async updateBookingStatus(id, status) {
        return this.request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getAllBookings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/bookings/admin/all?${query}`);
    }

    // ==================== CYLINDER ENDPOINTS ====================

    async getMyCylinders() {
        return this.request('/cylinders');
    }

    async getCylinder(id) {
        return this.request(`/cylinders/${id}`);
    }

    async getDueCylinders() {
        return this.request('/cylinders/due');
    }

    async returnCylinder(id) {
        return this.request(`/cylinders/${id}/return`, {
            method: 'PUT'
        });
    }

    async createCylinder(cylinderData) {
        return this.request('/cylinders', {
            method: 'POST',
            body: JSON.stringify(cylinderData)
        });
    }

    async updateCylinderStatus(id, status) {
        return this.request(`/cylinders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ==================== PAYMENT ENDPOINTS ====================

    async createPaymentOrder(bookingId) {
        return this.request('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
    }

    async verifyPayment(paymentData) {
        return this.request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async getPayment(id) {
        return this.request(`/payments/${id}`);
    }

    async getPaymentHistory(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/payments/history?${query}`);
    }

    async recordCashPayment(bookingId, amount) {
        return this.request('/payments/cash', {
            method: 'POST',
            body: JSON.stringify({ bookingId, amount })
        });
    }

    async processRefund(id, amount, reason) {
        return this.request(`/payments/${id}/refund`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason })
        });
    }

    async getRefundStatus(id) {
        return this.request(`/payments/${id}/refund-status`);
    }

    // ==================== DELIVERY ENDPOINTS ====================

    async getDelivery(bookingId) {
        return this.request(`/delivery/${bookingId}`);
    }

    async assignDelivery(bookingId, deliveryPersonId) {
        return this.request(`/delivery/${bookingId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ deliveryPersonId })
        });
    }

    async updateDeliveryLocation(bookingId, location) {
        return this.request(`/delivery/${bookingId}/location`, {
            method: 'PUT',
            body: JSON.stringify(location)
        });
    }

    async updateDeliveryStatus(bookingId, statusData) {
        return this.request(`/delivery/${bookingId}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    async getMyDeliveries(status) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/delivery/my-deliveries${query}`);
    }

    async getAllDeliveries(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/delivery/admin/all?${query}`);
    }

    async rateDelivery(bookingId, rating, feedback) {
        return this.request(`/delivery/${bookingId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating, feedback })
        });
    }

    // ==================== INVOICE ENDPOINTS ====================

    async getMyInvoices(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/invoices?${query}`);
    }

    async getInvoice(id) {
        return this.request(`/invoices/${id}`);
    }

    async downloadInvoicePDF(id) {
        const url = `${this.baseURL}/invoices/${id}/pdf`;
        window.open(url, '_blank');
    }

    async getAllInvoices(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/invoices/admin/all?${query}`);
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    async getCustomerProfile() {
        return this.request('/customers/profile');
    }

    async getCustomerHistory(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/customers/history?${query}`);
    }

    async getCustomerAnalytics() {
        return this.request('/customers/analytics');
    }

    async getLoyaltyPoints() {
        return this.request('/customers/loyalty');
    }

    async getCustomerPreferences() {
        return this.request('/customers/preferences');
    }

    async updateCustomerPreferences(preferences) {
        return this.request('/customers/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async getAllCustomers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/customers/admin/all?${query}`);
    }

    // ==================== ADMIN ENDPOINTS ====================

    async getDashboardAnalytics(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/dashboard?${query}`);
    }

    async getAllUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/users?${query}`);
    }

    async updateUserStatus(id, isActive) {
        return this.request(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });
    }

    async updateUserRole(id, role) {
        return this.request(`/admin/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async deleteUser(id) {
        return this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    }

    async generateReports(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/reports?${query}`);
    }

    // ==================== NOTIFICATION ENDPOINTS ====================

    async testNotification(type, email, phone) {
        return this.request('/notifications/test', {
            method: 'POST',
            body: JSON.stringify({ type, email, phone })
        });
    }
}

// Create and export API instance
const api = new APIClient();

// Make it available globally
window.api = api;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
