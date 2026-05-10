const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { sendVerificationEmail, generateVerificationOTP } = require('../utils/emailService');

const router = express.Router();

router.post('/register', upload.single('avatar'), async (req, res) => {
  const { name, email, password, role, phone, address, college, degree, educationDetails, skills, experience, linkedin, github, about } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const skillsArray = typeof skills === 'string' ? skills.split(',').map((skill) => skill.trim()).filter(Boolean) : [];
    const normalizedRole = role === 'recruiter' ? 'employer' : role;

    // Generate verification OTP
    const verificationOTP = generateVerificationOTP();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      emailVerified: false,
      emailVerificationToken: verificationOTP,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      avatarPath: req.file ? `/uploads/avatars/${req.file.filename}` : '',
      phone: phone || '',
      address: address || '',
      college: college || '',
      degree: degree || '',
      educationDetails: educationDetails || '',
      skills: skillsArray,
      experience: experience || '',
      linkedin: linkedin || '',
      github: github || '',
      about: about || ''
    });
    await user.save();

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, verificationOTP);
      console.log('Email sent successfully:', emailResult);
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for the verification code.',
        emailSent: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (emailError) {
      // If email fails, still create user but inform them
      console.error('Email sending failed:', emailError.message);
      res.status(201).json({
        success: true,
        message: 'Account created! But we couldn\'t send the verification email. Check console logs or use resend button.',
        emailSent: false,
        emailError: emailError.message,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate and send OTP
      const verificationOTP = generateVerificationOTP();
      user.emailVerificationToken = verificationOTP;
      user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      try {
        const emailResult = await sendVerificationEmail(email, verificationOTP);
        console.log('Verification email sent for login attempt', emailResult);
        return res.status(403).json({
          message: 'Please verify your email before logging in.',
          emailVerified: false,
          otpSent: true,
          previewUrl: emailResult.previewUrl || undefined
        });
      } catch (emailError) {
        console.error('Failed to send verification email during login:', emailError.message);
        return res.status(403).json({
          message: 'Please verify your email before logging in.',
          emailVerified: false,
          otpSent: false,
          emailError: emailError.message
        });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const normalizedRole = user.role === 'recruiter' ? 'employer' : user.role;
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: normalizedRole, 
        emailVerified: user.emailVerified,
        avatarPath: user.avatarPath,
        phone: user.phone,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        resumePath: user.resumePath
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      emailVerificationToken: otp,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const verificationOTP = generateVerificationOTP();
    user.emailVerificationToken = verificationOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, verificationOTP);
      console.log('Resend verification email sent:', emailResult);
      res.json({ 
        success: true,
        message: 'Verification code sent successfully to your email',
        previewUrl: emailResult.previewUrl || undefined
      });
    } catch (emailError) {
      console.error('Error sending resend verification email:', emailError.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send verification email. Please check your email address or try again later.',
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
});

module.exports = router;
