const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        });
        logger.info('Email sent: ' + info.messageId);
        return info;
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
};

const sendOrderConfirmation = async (order, user) => {
    const subject = `Order Confirmation - Order #${order.id}`;
    const html = `
        <h1>Order Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Your order has been confirmed. Order details:</p>
        <ul>
            <li>Order ID: ${order.id}</li>
            <li>Total Amount: $${order.totalAmount}</li>
            <li>Status: ${order.status}</li>
        </ul>
        <p>Thank you for shopping with us!</p>
    `;
    return sendEmail(user.email, subject, html);
};

const sendPasswordReset = async (user, resetToken) => {
    const subject = 'Password Reset Request';
    const html = `
        <h1>Password Reset Request</h1>
        <p>Dear ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
    `;
    return sendEmail(user.email, subject, html);
};

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendPasswordReset
};
