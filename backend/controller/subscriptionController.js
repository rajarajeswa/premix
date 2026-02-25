const { Subscriber } = require('../model/Subscriber');
const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Subscribe to newsletter
 * POST /api/subscribe
 */
const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({
            where: { email: normalizedEmail }
        });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter'
                });
            } else {
                // Reactivate subscription
                await existingSubscriber.update({
                    isActive: true,
                    unsubscribedAt: null
                });

                // Send welcome back email
                await sendWelcomeEmail(normalizedEmail, true);

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed to our newsletter'
                });
            }
        }

        // Create new subscriber
        await Subscriber.create({
            email: normalizedEmail,
            isActive: true
        });

        // Send welcome email
        const emailResult = await sendWelcomeEmail(normalizedEmail, false);

        // Notify admin about new subscriber
        await notifyAdminNewSubscriber(normalizedEmail);

        return res.status(201).json({
            success: true,
            message: emailResult.success 
                ? 'Successfully subscribed! Check your email for a welcome message.'
                : 'Successfully subscribed! (Welcome email could not be sent - please check your email configuration)'
        });

    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again.',
            error: error.message
        });
    }
};

/**
 * Unsubscribe from newsletter
 * POST /api/unsubscribe
 */
const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const subscriber = await Subscriber.findOne({
            where: { email: normalizedEmail }
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our subscription list'
            });
        }

        if (!subscriber.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This email is already unsubscribed'
            });
        }

        await subscriber.update({
            isActive: false,
            unsubscribedAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'You have been unsubscribed from our newsletter'
        });

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe. Please try again.',
            error: error.message
        });
    }
};

/**
 * Get all subscribers (admin only)
 * GET /api/subscribers
 */
const getSubscribers = async (req, res) => {
    try {
        const { activeOnly } = req.query;

        const whereClause = activeOnly === 'true' 
            ? { isActive: true }
            : {};

        const subscribers = await Subscriber.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            count: subscribers.length,
            subscribers: subscribers.map(s => ({
                id: s.id,
                email: s.email,
                isActive: s.isActive,
                subscribedAt: s.subscribedAt,
                unsubscribedAt: s.unsubscribedAt
            }))
        });

    } catch (error) {
        console.error('Get subscribers error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers',
            error: error.message
        });
    }
};

/**
 * Send welcome email to new subscriber
 */
const sendWelcomeEmail = async (email, isReactivation = false) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️ Email not configured. Skipping welcome email.');
        return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const subject = isReactivation 
        ? 'Welcome Back to Kara-Saaram! 🌶️'
        : 'Welcome to Kara-Saaram! 🌶️';

    const mailOptions = {
        from: `"Kara-Saaram" <${user}>`,
        to: email,
        subject: subject,
        text: isReactivation
            ? `Welcome back!

We're excited to have you back in the Kara-Saaram family!

As a subscriber, you'll receive:
• Authentic Chettinadu recipes
• Cooking tips and techniques
• Exclusive offers and discounts
• New product announcements

Thank you for staying connected with us!

Best regards,
Kara-Saaram Team
Authentic Chettinadu Masalas

---
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.`
            : `Welcome to the Kara-Saaram family!

Thank you for subscribing to our newsletter!

As a subscriber, you'll receive:
• Authentic Chettinadu recipes
• Cooking tips and techniques
• Exclusive offers and discounts
• New product announcements

We're excited to share our culinary heritage with you!

Best regards,
Kara-Saaram Team
Authentic Chettinadu Masalas

---
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 2rem;">Kara-Saaram</h1>
        <p style="color: #F5EDE4; margin: 5px 0 0;">Authentic Chettinadu Masalas</p>
    </div>
    <div style="padding: 30px; background: #FFFEF9;">
        <h2 style="color: #722F37; text-align: center;">
            ${isReactivation ? 'Welcome Back! 🎉' : 'Welcome to the Family! 🌶️'}
        </h2>
        <p style="text-align: center; color: #5A5A5A;">
            ${isReactivation 
                ? "We're excited to have you back in the Kara-Saaram family!" 
                : "Thank you for subscribing to our newsletter!"}
        </p>
        <div style="background: #F5EDE4; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #722F37; margin-top: 0;">As a subscriber, you'll receive:</h3>
            <ul style="color: #5A5A5A; line-height: 1.8;">
                <li>🌶️ Authentic Chettinadu recipes</li>
                <li>👨‍🍳 Cooking tips and techniques</li>
                <li>💰 Exclusive offers and discounts</li>
                <li>📦 New product announcements</li>
            </ul>
        </div>
        <p style="text-align: center; color: #5A5A5A;">
            ${isReactivation 
                ? "Thank you for staying connected with us!" 
                : "We're excited to share our culinary heritage with you!"}
        </p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://karasaaram.com" style="background: linear-gradient(135deg, #D4AF37, #B8962E); color: #2C2420; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
        </div>
        <p style="text-align: center; margin-top: 30px; color: #722F37;">
            Best regards,<br>
            <strong>Kara-Saaram Team</strong>
        </p>
    </div>
    <div style="background: #2C2420; padding: 20px; text-align: center; color: #9E9186;">
        <p style="margin: 0 0 10px;">© 2024 Kara-Saaram. All rights reserved.</p>
        <p style="margin: 0; font-size: 0.85rem;">
            To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.
        </p>
    </div>
</div>`
    };

    try {
        console.log(`📧 Sending welcome email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully!');
        console.log(`✅ Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Welcome email error:', err.message);
        return { success: false, message: err.message };
    }
};

/**
 * Notify admin about new subscriber
 */
const notifyAdminNewSubscriber = async (email) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || user;

    if (!user || !pass) {
        return { success: false };
    }

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Kara-Saaram Newsletter" <${user}>`,
        to: adminEmail,
        subject: `📬 New Newsletter Subscriber: ${email}`,
        text: `New newsletter subscription!

Email: ${email}
Subscribed at: ${new Date().toLocaleString()}

Total active subscribers can be viewed in the admin dashboard.

Kara-Saaram Newsletter System`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: #722F37; padding: 15px; border-radius: 10px 10px 0 0;">
        <h2 style="color: #D4AF37; margin: 0;">📬 New Newsletter Subscriber</h2>
    </div>
    <div style="background: #F5EDE4; padding: 20px; border-radius: 0 0 10px 10px;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
    </div>
</div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification sent for new subscriber');
        return { success: true };
    } catch (err) {
        console.error('❌ Admin notification error:', err.message);
        return { success: false };
    }
};

module.exports = {
    subscribe,
    unsubscribe,
    getSubscribers
};
