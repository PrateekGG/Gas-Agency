const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Send SMS
exports.sendSMS = async (to, message) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.log('Twilio not configured, skipping SMS');
            return null;
        }

        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });

        console.log('SMS sent:', result.sid);
        return result;
    } catch (error) {
        console.error('SMS error:', error);
        throw new Error(`Failed to send SMS: ${error.message}`);
    }
};

// Booking confirmation SMS
exports.sendBookingConfirmationSMS = async (phone, booking) => {
    const message = `GasFlow: Your booking ${booking.bookingNumber} is confirmed! ${booking.quantity}x ${booking.cylinderType} cylinder(s) for ₹${booking.amount}. Scheduled: ${new Date(booking.scheduledDate).toLocaleDateString()}. Track at ${process.env.FRONTEND_URL}`;

    return await this.sendSMS(phone, message);
};

// Delivery update SMS
exports.sendDeliveryUpdateSMS = async (phone, booking, delivery) => {
    const statusMessages = {
        'assigned': 'assigned to delivery person',
        'picked-up': 'picked up',
        'in-transit': 'on the way',
        'nearby': 'nearby your location',
        'delivered': 'delivered successfully'
    };

    const message = `GasFlow: Your order ${booking.bookingNumber} is ${statusMessages[delivery.status] || 'updated'}. ${delivery.deliveryPersonName ? `Delivery by: ${delivery.deliveryPersonName}, ${delivery.deliveryPersonPhone}` : 'Track at ' + process.env.FRONTEND_URL}`;

    return await this.sendSMS(phone, message);
};

// Payment confirmation SMS
exports.sendPaymentConfirmationSMS = async (phone, payment, booking) => {
    const message = `GasFlow: Payment of ₹${payment.amount} received successfully. Transaction ID: ${payment.transactionId}. Booking: ${booking.bookingNumber}. Thank you!`;

    return await this.sendSMS(phone, message);
};

// OTP SMS
exports.sendOTP = async (phone, otp) => {
    const message = `GasFlow: Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    return await this.sendSMS(phone, message);
};

// Delivery reminder SMS
exports.sendDeliveryReminderSMS = async (phone, booking) => {
    const message = `GasFlow: Reminder! Your gas cylinder delivery is scheduled for ${new Date(booking.scheduledDate).toLocaleDateString()}. Booking: ${booking.bookingNumber}. Ensure someone is available.`;

    return await this.sendSMS(phone, message);
};

// Refund notification SMS
exports.sendRefundNotificationSMS = async (phone, payment, booking) => {
    const message = `GasFlow: Refund of ₹${payment.refundDetails.refundAmount} initiated for booking ${booking.bookingNumber}. Will be credited in 5-7 business days.`;

    return await this.sendSMS(phone, message);
};
