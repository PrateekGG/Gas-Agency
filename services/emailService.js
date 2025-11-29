const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send email
exports.sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'GasFlow <noreply@gasflow.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Booking confirmation email
exports.sendBookingConfirmation = async (user, booking) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-label { font-weight: bold; color: #6b7280; }
                .detail-value { color: #111827; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Booking Confirmed!</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>Your gas cylinder booking has been confirmed successfully.</p>
                    
                    <div class="booking-details">
                        <h3>Booking Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Booking Number:</span>
                            <span class="detail-value">${booking.bookingNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Cylinder Type:</span>
                            <span class="detail-value">${booking.cylinderType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">${booking.quantity}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value">₹${booking.amount}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Scheduled Date:</span>
                            <span class="detail-value">${new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${booking.status.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <p>We will notify you once your order is out for delivery.</p>
                    
                    <center>
                        <a href="${process.env.FRONTEND_URL}/dashboard.html" class="button">View Booking</a>
                    </center>
                </div>
                <div class="footer">
                    <p>© 2024 GasFlow. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await this.sendEmail({
        to: user.email,
        subject: `Booking Confirmed - ${booking.bookingNumber}`,
        html
    });
};

// Delivery status update email
exports.sendDeliveryUpdate = async (user, booking, delivery) => {
    const statusMessages = {
        'assigned': 'Your delivery has been assigned to a delivery person.',
        'picked-up': 'Your order has been picked up and is being prepared.',
        'in-transit': 'Your order is on the way!',
        'nearby': 'Your delivery person is nearby.',
        'delivered': 'Your order has been delivered successfully!'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
                .delivery-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📦 Delivery Update</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>${statusMessages[delivery.status] || 'Your delivery status has been updated.'}</p>
                    
                    <center>
                        <span class="status-badge">${delivery.status.toUpperCase().replace('-', ' ')}</span>
                    </center>
                    
                    <div class="delivery-info">
                        <h3>Delivery Details</h3>
                        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
                        ${delivery.deliveryPersonName ? `<p><strong>Delivery Person:</strong> ${delivery.deliveryPersonName}</p>` : ''}
                        ${delivery.deliveryPersonPhone ? `<p><strong>Contact:</strong> ${delivery.deliveryPersonPhone}</p>` : ''}
                        ${delivery.estimatedTime ? `<p><strong>Estimated Time:</strong> ${new Date(delivery.estimatedTime).toLocaleString()}</p>` : ''}
                    </div>
                    
                    <p>Thank you for choosing GasFlow!</p>
                </div>
                <div class="footer">
                    <p>© 2024 GasFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await this.sendEmail({
        to: user.email,
        subject: `Delivery Update - ${booking.bookingNumber}`,
        html
    });
};

// Payment receipt email
exports.sendPaymentReceipt = async (user, booking, payment, invoice) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .amount { font-size: 32px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Payment Successful</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>We have received your payment successfully.</p>
                    
                    <div class="amount">₹${payment.amount}</div>
                    
                    <div class="receipt">
                        <h3>Payment Receipt</h3>
                        <div class="detail-row">
                            <span>Transaction ID:</span>
                            <span>${payment.transactionId}</span>
                        </div>
                        <div class="detail-row">
                            <span>Booking Number:</span>
                            <span>${booking.bookingNumber}</span>
                        </div>
                        ${invoice ? `
                        <div class="detail-row">
                            <span>Invoice Number:</span>
                            <span>${invoice.invoiceNumber}</span>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                            <span>Payment Method:</span>
                            <span>${payment.paymentMethod.toUpperCase()}</span>
                        </div>
                        <div class="detail-row">
                            <span>Date:</span>
                            <span>${new Date(payment.paidAt || payment.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span>Status:</span>
                            <span style="color: #10B981; font-weight: bold;">${payment.status.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <p>Thank you for your payment!</p>
                </div>
                <div class="footer">
                    <p>© 2024 GasFlow. All rights reserved.</p>
                    <p>Keep this email for your records.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await this.sendEmail({
        to: user.email,
        subject: `Payment Receipt - ${payment.transactionId}`,
        html
    });
};

// Password reset email
exports.sendPasswordResetEmail = async (user, resetUrl) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    
                    <center>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </center>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <p>This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <p style="word-break: break-all; color: #3B82F6;">${resetUrl}</p>
                </div>
                <div class="footer">
                    <p>© 2024 GasFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await this.sendEmail({
        to: user.email,
        subject: 'Password Reset Request - GasFlow',
        html
    });
};

// Welcome email
exports.sendWelcomeEmail = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .feature { padding: 10px 0; }
                .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to GasFlow!</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>Thank you for registering with GasFlow. We're excited to have you on board!</p>
                    
                    <div class="features">
                        <h3>What you can do:</h3>
                        <div class="feature">✅ Book gas cylinders online</div>
                        <div class="feature">📦 Track your deliveries in real-time</div>
                        <div class="feature">💳 Make secure online payments</div>
                        <div class="feature">📄 Download invoices instantly</div>
                        <div class="feature">🔔 Get instant notifications</div>
                    </div>
                    
                    <center>
                        <a href="${process.env.FRONTEND_URL}/dashboard.html" class="button">Go to Dashboard</a>
                    </center>
                    
                    <p>If you have any questions, feel free to contact our support team.</p>
                </div>
                <div class="footer">
                    <p>© 2024 GasFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await this.sendEmail({
        to: user.email,
        subject: 'Welcome to GasFlow!',
        html
    });
};
