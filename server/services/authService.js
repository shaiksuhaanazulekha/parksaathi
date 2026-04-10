const nodemailer = require('nodemailer');

// Email Transporter (Placeholder config - User should update in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.EMAIL_PASS || 'placeholder_pass'
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${email}`;

    const mailOptions = {
        from: '"ParkSaathi" <noreply@parksaathi.com>',
        to: email,
        subject: 'Verify your ParkSaathi Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4F46E5;">Welcome to ParkSaathi!</h2>
                <p>Thank you for signing up. Please verify your email address to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px;">${verificationUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">If you didn't create an account, skip this email.</p>
            </div>
        `
    };

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log("--- REAL EMAIL NOT SENT (Missing Config) ---");
            console.log(`To: ${email}\nLink: ${verificationUrl}`);
            console.log("------------------------------------------");
        }
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const sendOtpSms = async (phone, otp) => {
    try {
        // Logic for Twilio / Fast2SMS
        // Example: const client = require('twilio')(sid, auth); ...

        console.log("--- REAL SMS NOT SENT (Simulation) ---");
        console.log(`To: ${phone}\nOTP: ${otp}`);
        console.log("---------------------------------------");

        // Return true to simulate success
        return true;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendOtpSms
};
