const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../model/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kara-saaram-secret-change-in-production';
const JWT_EXPIRY = '30d'; // Extended to 30 days for better user experience

const get = (fields, key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

const sendUser = (res, user, status = 200) => {
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.status(status).json({ 
        success: true, 
        message: status === 201 ? 'Registered successfully' : 'Login successful', 
        token, 
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone } 
    });
};

// Create email transporter
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

const login = async (req, res) => {
    const [user] = await User.findAll({ where: { email: req.auth.email } });
    if (!user || !(await bcrypt.compare(req.auth.password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    sendUser(res, user);
};

const register = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
        if (err) return res.status(400).json({ success: false, message: 'Invalid form data' });
        const email = String(get(fields, 'email') || '').trim().toLowerCase();
        const password = String(get(fields, 'password') || '');
        const name = String(get(fields, 'name') || '').trim() || null;
        const phone = String(get(fields, 'phone') || '').trim() || null;
        
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password at least 6 characters' });
        if (await User.findOne({ where: { email } })) return res.status(400).json({ success: false, message: 'Email already registered' });
        
        const user = await User.create({ 
            email, 
            password: await bcrypt.hash(password, 10), 
            name,
            phone
        });
        
        // Send welcome email
        await sendWelcomeEmail(email, name);
        
        sendUser(res, user, 201);
    });
};

/**
 * Send welcome email to newly registered user
 */
const sendWelcomeEmail = async (email, name) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('Email not configured. Skipping welcome email.');
        return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
        from: `"Kara-Saaram" <${user}>`,
        to: email,
        subject: 'Welcome to Kara-Saaram! Your Culinary Journey Begins! ',
        text: `Welcome to Kara-Saaram, ${name || 'Valued Customer'}!

Thank you for creating an account with us. You're now part of the Kara-Saaram family!

Your account gives you access to:
- Quick and secure checkout
- Order history and tracking
- Exclusive member-only offers
- Authentic Chettinadu recipes and cooking tips

Start exploring our authentic Chettinadu masalas and premixes:
${frontendUrl}

If you have any questions, feel free to reach out to us.

Happy cooking!
Best regards,
Kara-Saaram Team
Authentic Chettinadu Masalas`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 2rem;">Kara-Saaram</h1>
        <p style="color: #F5EDE4; margin: 5px 0 0;">Authentic Chettinadu Masalas</p>
    </div>
    <div style="padding: 30px; background: #FFFEF9;">
        <h2 style="color: #722F37; text-align: center;">Welcome to the Family! </h2>
        <p style="text-align: center; color: #5A5A5A; font-size: 1.1rem;">
            Hello ${name || 'Valued Customer'},
        </p>
        <p style="text-align: center; color: #5A5A5A;">
            Thank you for creating an account with us. You're now part of the Kara-Saaram family!
        </p>
        <div style="background: #F5EDE4; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #722F37; margin-top: 0; text-align: center;">Your Account Benefits:</h3>
            <ul style="color: #5A5A5A; line-height: 1.8;">
                <li> Quick and secure checkout</li>
                <li> Order history and tracking</li>
                <li> Exclusive member-only offers</li>
                <li> Authentic Chettinadu recipes and cooking tips</li>
            </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}" style="background: linear-gradient(135deg, #D4AF37, #B8962E); color: #2C2420; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Shopping</a>
        </div>
        <p style="text-align: center; color: #5A5A5A;">
            We're excited to share our culinary heritage with you!
        </p>
        <p style="text-align: center; margin-top: 30px; color: #722F37;">
            Happy cooking!<br>
            <strong>Kara-Saaram Team</strong>
        </p>
    </div>
    <div style="background: #2C2420; padding: 20px; text-align: center; color: #9E9186;">
        <p style="margin: 0 0 10px;"> 2024 Kara-Saaram. All rights reserved.</p>
        <p style="margin: 0; font-size: 0.85rem;">
            Authentic Chettinadu Masalas - Made with Love
        </p>
    </div>
</div>`
    };

    try {
        console.log(`Sending welcome email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully!');
        console.log(`Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Welcome email error:', err.message);
        return { success: false, message: err.message };
    }
};

// Forgot Password - Send Reset Link
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set token and expiry (1 hour)
        await user.update({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        });

        // Send email
        const transporter = createTransporter();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        if (transporter) {
            const mailOptions = {
                from: `"Kara-Saaram" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset Request - Kara-Saaram',
                text: `Hello ${user.name || 'User'},

You requested a password reset for your Kara-Saaram account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request this, please ignore this email.

Best regards,
Kara-Saaram Team`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">Kara-Saaram</h1>
        <p style="color: #F5EDE4; margin: 5px 0 0;">Password Reset</p>
    </div>
    <div style="padding: 30px; background: #FFFEF9;">
        <h2 style="color: #722F37;">Hello ${user.name || 'User'},</h2>
        <p>You requested a password reset for your Kara-Saaram account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #D4AF37, #B8962E); color: #2C2420; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 0.9rem;">Or copy this link: <br><code style="word-break: break-all; background: #f5f5f5; padding: 5px;">${resetUrl}</code></p>
        <p style="color: #999; font-size: 0.85rem;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 0.85rem;">If you did not request this, please ignore this email.</p>
    </div>
    <div style="background: #2C2420; padding: 20px; text-align: center; color: #9E9186;">
        <p style="margin: 0;">© 2024 Kara-Saaram. All rights reserved.</p>
    </div>
</div>`
            };

            await transporter.sendMail(mailOptions);
            console.log('Password reset email sent to:', user.email);
        } else {
            console.warn('Email not configured. Reset token generated but not sent.');
            console.log('Reset URL:', resetUrl);
        }

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                resetPasswordToken: resetTokenHash,
                resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        // Send confirmation email
        const transporter = createTransporter();
        if (transporter) {
            await transporter.sendMail({
                from: `"Kara-Saaram" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Changed - Kara-Saaram',
                text: `Hello ${user.name || 'User'},

Your password has been successfully changed.

If you did not make this change, please contact us immediately.

Best regards,
Kara-Saaram Team`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #722F37, #5A252C); padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">Kara-Saaram</h1>
    </div>
    <div style="padding: 30px; background: #FFFEF9;">
        <h2 style="color: #722F37;">Password Changed Successfully</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>Your password has been successfully changed.</p>
        <p style="color: #999; font-size: 0.85rem;">If you did not make this change, please contact us immediately.</p>
    </div>
</div>`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };
