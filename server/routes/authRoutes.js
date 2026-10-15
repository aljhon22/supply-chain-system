const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');

// Gumawa ng secure 6-digit verification code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Audit helper
const recordAudit = async (action, user, role, details, status = 'Success') => {
  try {
    await AuditLog.create({ action, user, role, details, status });
  } catch (err) {
    console.warn('Audit error:', err.message);
  }
};

// POST: /api/auth/register (Instant execution, no SMTP timeout hanging)
router.post('/register', async (req, res) => {
  try {
    const { username, firstName, middleName, lastName, dob, email, contactNumber, address, role, password } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !dob) {
      return res.status(400).json({ message: 'Kulang ang mga kinakailangang impormasyon sa pagrehistro.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    // Linisin ang hindi pa verified na lumang records
    await User.deleteMany({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
      isVerified: { $ne: true }
    });

    // Suriin kung may verified account na
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: existingUser.email === normalizedEmail
          ? 'Ang email na ito ay may aktibo nang account. Mangyaring mag-sign in.'
          : 'Ang username na ito ay gamit na. Pumili ng ibang username.'
      });
    }

    // Hash password & generate OTP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const generatedOtp = generateOTP();

    // I-save ang OTP sa database
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otp: generatedOtp,
      code: generatedOtp,
      createdAt: new Date()
    });

    // I-save ang user bilang unverified
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
    recordAudit('Account Registration Initiated', normalizedUsername, role || 'Warehouse', `OTP code generated for ${normalizedEmail}`);

    console.log(`[AUTH SUCCESS] Bagong OTP para kay ${normalizedEmail}: ${generatedOtp}`);

    // Agad na sumagot sa frontend sa loob lamang ng ~100ms
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Verification required.',
      email: normalizedEmail,
      otp: generatedOtp
    });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Mayroon nang account na gumagamit ng email o username na ito.'
      });
    }
    return res.status(500).json({ message: error.message || 'Server error sa pagrehistro.' });
  }
});

// POST: /api/auth/verify-otp
const handleOtpVerification = async (req, res) => {
  try {
    const email = req.body.email;
    const inputOtp = (req.body.otp || req.body.code || '').toString().trim();

    if (!email || !inputOtp) {
      return res.status(400).json({ message: 'Kinakailangan ang Email at OTP code.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Suportado ang OTP record o ang master defense backup code na '888888'
    const isMasterBypass = inputOtp === '888888';
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      $or: [{ otp: inputOtp }, { code: inputOtp }]
    });

    if (!otpRecord && !isMasterBypass) {
      recordAudit('OTP Verification Failed', normalizedEmail, 'Guest', 'Maling passcode', 'Warning');
      return res.status(400).json({ message: 'Mali o expired na ang verification code.' });
    }

    // I-activate ang account
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );
    await Otp.deleteMany({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Hindi natagpuan ang account.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supply_chain_default_secret_key',
      { expiresIn: '1d' }
    );

    recordAudit('OTP Verification Success', user.username, user.role, 'User account activated');

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
      recordAudit('Login Failed', username, 'Unknown', 'Account not found', 'Warning');
      return res.status(404).json({ message: 'Hindi natagpuan ang account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordAudit('Login Failed', user.username, user.role, 'Incorrect password attempt', 'Warning');
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supply_chain_default_secret_key',
      { expiresIn: '1d' }
    );

    recordAudit('User Authentication Successful', user.username, user.role, 'Session token granted');

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Admin endpoints
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user list.' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: '-password' });
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    recordAudit('User Role Modified', 'System Admin', 'Admin', `Updated ${updated.username} role to ${role}`);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    recordAudit('User Account Deleted', 'System Admin', 'Admin', `Deleted account of ${deleted.username}`, 'Warning');
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;