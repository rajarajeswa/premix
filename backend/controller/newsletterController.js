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
 * Send newsletter to all active subscribers
 * POST /api/newsletter/send
 * Body: { subject, content, htmlContent (optional) }
 */
const sendNewsletter = async (req, res) => {
    try {
        const { subject, content, htmlContent } = req.body;

        if (!subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Subject and content are required'
            });
        }

        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            return res.status(500).json({
                success: false,
                message: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env'
            });
        }

        // Get all active subscribers
        const subscribers = await Subscriber.findAll({
            where: { isActive: true },
            attributes: ['email']
        });

        if (subscribers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active subscribers to send newsletter to'
            });
        }

        const transporter = createTransporter();
        const emailList = subscribers.map(s => s.email);

        // Default HTML template for newsletter
        const defaultHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 2rem;">Kara-Saaram</h1>
        <p style="color: #F5EDE4; margin: 5px 0 0;">Authentic Chettinadu Masalas</p>
    </div>
    <div style="padding: 30px; background: #FFFEF9;">
        ${htmlContent || content.replace(/\n/g, '<br>')}
    </div>
    <div style="background: #2C2420; padding: 20px; text-align: center; color: #9E9186;">
        <p style="margin: 0 0 10px;">© 2024 Kara-Saaram. All rights reserved.</p>
        <p style="margin: 0; font-size: 0.85rem;">
            You're receiving this because you subscribed to our newsletter.
        </p>
    </div>
</div>`;

        const mailOptions = {
            from: `"Kara-Saaram Newsletter" <${user}>`,
            to: user, // Send to yourself
            bcc: emailList, // BCC all subscribers
            subject: subject,
            text: content,
            html: defaultHtml
        };

        console.log(`📧 Sending newsletter to ${emailList.length} subscribers...`);

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Newsletter sent successfully!');
        console.log(`✅ Message ID: ${info.messageId}`);

        return res.status(200).json({
            success: true,
            message: `Newsletter sent successfully to ${emailList.length} subscribers`,
            recipientCount: emailList.length,
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Newsletter send error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send newsletter',
            error: error.message
        });
    }
};

/**
 * Get subscriber statistics
 * GET /api/newsletter/stats
 */
const getNewsletterStats = async (req, res) => {
    try {
        const totalSubscribers = await Subscriber.count();
        const activeSubscribers = await Subscriber.count({
            where: { isActive: true }
        });
        const unsubscribedCount = await Subscriber.count({
            where: { isActive: false }
        });

        // Get recent subscribers (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSubscribers = await Subscriber.count({
            where: {
                isActive: true,
                createdAt: {
                    [require('sequelize').Op.gte]: sevenDaysAgo
                }
            }
        });

        return res.status(200).json({
            success: true,
            stats: {
                total: totalSubscribers,
                active: activeSubscribers,
                unsubscribed: unsubscribedCount,
                recentSignups: recentSubscribers
            }
        });

    } catch (error) {
        console.error('Get newsletter stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get newsletter statistics',
            error: error.message
        });
    }
};

module.exports = {
    sendNewsletter,
    getNewsletterStats
};
