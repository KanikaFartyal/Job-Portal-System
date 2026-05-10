const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter with Gmail SMTP
const createTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Check if Gmail credentials are properly configured
  if (user && pass && user !== 'your_gmail@gmail.com' && pass !== 'your_16_character_app_password') {
    console.log('\n=== Gmail SMTP Configuration ===');
    console.log('Email:', user);
    console.log('Using Gmail SMTP (smtp.gmail.com:587)');
    console.log('================================\n');
    
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: pass
      },
      connectionTimeout: 5000,
      socketTimeout: 5000
    });
  }

  // Fallback to Ethereal for development/testing
  console.log('\n=== Email Service Configuration ===');
  console.log('Gmail credentials NOT configured.');
  console.log('To use real Gmail, add to .env:');
  console.log('  EMAIL_USER=your_gmail@gmail.com');
  console.log('  EMAIL_PASS=your_16_char_app_password');
  console.log('Using Ethereal test email service for development');
  console.log('====================================\n');
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account:', testAccount.user);
    console.log('Preview emails at: https://ethereal.email/messages\n');
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error);
    throw error;
  }
};

let transporter;

const initializeTransporter = async () => {
  transporter = await createTransporter();
  // Verify transporter connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
    } else {
      console.log('Email transporter is ready to send emails');
    }
  });
};

// Initialize transporter
(async () => {
  await initializeTransporter();
})();

const sendVerificationEmail = async (email, otp) => {
  if (!transporter) {
    throw new Error('Email service not initialized');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@jobhook.com',
    to: email,
    subject: 'Verify Your Email - JobHook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to JobHook!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up. Please verify your email address by entering the verification code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f59e0b; color: #ffffff; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          <p style="color: #999; line-height: 1.6; font-size: 12px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log('\n>>> Sending verification email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Verification email sent successfully');
    console.log('  Message ID:', info.messageId);
    console.log('  Response:', info.response);
    
    let previewUrl;
    if (info.messageId && nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('  Preview URL:', previewUrl, '\n');
    } else {
      console.log('  (Check your Gmail inbox)\n');
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('\n✗ Error sending verification email:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    console.error('  Details:', error);
    console.error('');
    throw error;
  }
};

const generateVerificationOTP = () => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendVerificationEmail,
  generateVerificationOTP
};