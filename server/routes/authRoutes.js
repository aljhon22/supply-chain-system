const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');

// Generate 6-digit verification code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Helper to record an audit trail event directly to DB
const recordAudit = async (action, user, role, details, status = 'Success') => {
  try {
    await AuditLog.create({ action, user, role, details, status });
  } catch (err) {
    console.warn('Audit recording non-fatal error:', err.message);
  }
};

// POST: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, firstName, middleName, lastName, dob, email, contactNumber, address, role, password } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !dob) {
      return res.status(400).json({ message: 'Required registration fields are missing.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    await User.deleteMany({ email: normalizedEmail, isVerified: false });

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const generatedCode = generateOTP();

    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otp: generatedCode,
      code: generatedCode,
      createdAt: new Date()
    });

    const newUser = new User({
      username: normalizedUsername,
      firstName: firstName.trim(),
      middleName: (middleName || '').trim(),
      lastName: lastName.trim(),
      dob: new Date(dob),
      email: normalizedEmail,
      contactNumber: (contactNumber || '').trim(),
      address: (address || '').trim(),
      role: role || 'Warehouse',
      password: hashedPassword,
      isVerified: false
    });

    await newUser.save();

    await recordAudit('Account Registration Initiated', normalizedUsername, role || 'Warehouse', `OTP code dispatched to ${normalizedEmail}`);

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Supply Chain Logistics" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: 'Account Registration Verification Passcode',
        html: `<h2>Account Verification</h2><p>Your code: <strong>${generatedCode}</strong></p>`
      });
    } catch (e) {
      console.warn('Email dispatch warning:', e.message);
    }

    return res.status(201).json({ message: 'Registration initiated. Verification OTP sent.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration error.' });
  }
});

// Shared verification handler
const handleOtpVerification = async (req, res) => {
  try {
    const email = req.body.email;
    const inputOtp = (req.body.otp || req.body.code || '').toString().trim();

    if (!email || !inputOtp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      $or: [{ otp: inputOtp }, { code: inputOtp }]
    });

    if (!otpRecord) {
      await recordAudit('OTP Verification Failed', normalizedEmail, 'Guest', 'Invalid passcode attempt', 'Warning');
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    const user = await User.findOneAndUpdate({ email: normalizedEmail }, { isVerified: true }, { new: true });
    await Otp.deleteMany({ email: normalizedEmail });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supply_chain_default_secret_key',
      { expiresIn: '1d' }
    );

    await recordAudit('OTP Verification Success', user.username, user.role, 'User account verified and activated');

    return res.status(200).json({
      message: 'Account verified successfully.',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

router.post('/verify-otp', handleOtpVerification);
router.post('/verify', handleOtpVerification);

// POST: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required.' });
    }

    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.toLowerCase().trim() }]
    });

    if (!user) {
      await recordAudit('Login Failed', username, 'Unknown', 'Account not found', 'Warning');
      return res.status(404).json({ message: 'Account not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await recordAudit('Login Failed', user.username, user.role, 'Incorrect password attempt', 'Warning');
      return res.status(400).json({ message: 'Incorrect credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supply_chain_default_secret_key',
      { expiresIn: '1d' }
    );

    await recordAudit('User Authentication Successful', user.username, user.role, 'Session token granted');

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET: /api/auth/users (Fetch all registered users for Admin panel)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user list.' });
  }
});

// PUT: /api/auth/users/:id/role (Admin: Change User Role)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: '-password' });
    if (!updated) return res.status(404).json({ message: 'User not found.' });

    await recordAudit('User Role Modified', 'System Admin', 'Admin', `Updated ${updated.username} role to ${role}`);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
});

// DELETE: /api/auth/users/:id (Admin: Delete User Account)
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });

    await recordAudit('User Account Deleted', 'System Admin', 'Admin', `Deleted account of ${deleted.username}`, 'Warning');
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;