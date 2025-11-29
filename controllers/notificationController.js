const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// Send notification (email + SMS)
exports.sendNotification = async (type, data) => {
    try {
        const { user, booking, delivery, payment, invoice } = data;

        switch (type) {
            case 'booking_confirmation':
                // Send email
                await emailService.sendBookingConfirmation(user, booking);

                // Send SMS
                if (user.phone) {
                    await smsService.sendBookingConfirmationSMS(user.phone, booking);
                }
                break;

            case 'delivery_update':
                // Send email
                await emailService.sendDeliveryUpdate(user, booking, delivery);

                // Send SMS
                if (user.phone) {
                    await smsService.sendDeliveryUpdateSMS(user.phone, booking, delivery);
                }
                break;

            case 'payment_receipt':
                // Send email
                await emailService.sendPaymentReceipt(user, booking, payment, invoice);

                // Send SMS
                if (user.phone) {
                    await smsService.sendPaymentConfirmationSMS(user.phone, payment, booking);
                }
                break;

            case 'welcome':
                // Send email only
                await emailService.sendWelcomeEmail(user);
                break;

            case 'password_reset':
                // Send email only
                const resetUrl = data.resetUrl;
                await emailService.sendPasswordResetEmail(user, resetUrl);
                break;

            case 'delivery_reminder':
                // Send SMS only
                if (user.phone) {
                    await smsService.sendDeliveryReminderSMS(user.phone, booking);
                }
                break;

            case 'refund_notification':
                // Send both
                if (user.phone) {
                    await smsService.sendRefundNotificationSMS(user.phone, payment, booking);
                }
                break;

            default:
                throw new Error(`Unknown notification type: ${type}`);
        }

        console.log(`Notification sent: ${type}`);
        return { success: true, type };
    } catch (error) {
        console.error('Notification error:', error);
        // Don't throw error - notifications should not break the main flow
        return { success: false, type, error: error.message };
    }
};

// @desc    Test notification
// @route   POST /api/notifications/test
// @access  Private (Admin)
exports.testNotification = async (req, res) => {
    try {
        const { type, email, phone } = req.body;

        const testUser = {
            name: 'Test User',
            email: email || req.user.email,
            phone: phone || req.user.phone
        };

        const testBooking = {
            bookingNumber: 'BK17012345670001',
            cylinderType: '14.2kg',
            quantity: 2,
            amount: 1800,
            scheduledDate: new Date(),
            status: 'confirmed'
        };

        const testDelivery = {
            status: 'in-transit',
            deliveryPersonName: 'John Doe',
            deliveryPersonPhone: '+919876543210',
            estimatedTime: new Date(Date.now() + 3600000)
        };

        const testPayment = {
            transactionId: 'TXN1701234567ABC',
            amount: 1800,
            paymentMethod: 'online',
            status: 'completed',
            paidAt: new Date()
        };

        const testInvoice = {
            invoiceNumber: 'INV20241100001'
        };

        await this.sendNotification(type, {
            user: testUser,
            booking: testBooking,
            delivery: testDelivery,
            payment: testPayment,
            invoice: testInvoice
        });

        res.status(200).json({
            success: true,
            message: `Test ${type} notification sent successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending test notification',
            error: error.message
        });
    }
};

module.exports = {
    sendNotification: exports.sendNotification,
    testNotification: exports.testNotification
};
