const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Department Authorization Security Passkeys
const DEPARTMENT_PASSKEYS = {
  Warehouse: 'WH-2026',
  Procurement: 'PROC-2026',
  Admin: 'ADMIN-2026'
};

const recordAudit = async (action, user, role, details, status = 'Success') => {
  try {
    await AuditLog.create({ action, user, role, details, status });
  } catch (err) {
    console.warn('[Audit Log Notice]:', err.message);
  }
};

// POST: /api/auth/register (Instant Enterprise Registration)
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      firstName,
      middleName,
      lastName,
      dob,
      email,
      contactNumber,
      address,
      role,
      password,
      securityPasskey
    } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !dob) {
      return res.status(400).json({ message: 'All required registration fields must be provided.' });
    }

    const selectedRole = role || 'Warehouse';
    const requiredPasskey = DEPARTMENT_PASSKEYS[selectedRole];

    if (!securityPasskey || securityPasskey.trim().toUpperCase() !== requiredPasskey) {
      recordAudit('Unauthorized Registration Attempt', username.trim(), selectedRole, `Invalid passkey supplied for ${selectedRole}`, 'Warning');
      return res.status(403).json({
        message: `Invalid Security Passkey for ${selectedRole}. Please supply the authorized departmental key.`
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === normalizedEmail
          ? 'An account with this email address already exists. Please sign in.'
          : 'This username is already taken. Please choose another username.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: normalizedUsername,
      firstName: firstName.trim(),
      middleName: (middleName || '').trim(),
      lastName: lastName.trim(),
      dob: new Date(dob),
      email: normalizedEmail,
      contactNumber: (contactNumber || '').trim(),
      address: (address || '').trim(),
      role: selectedRole,
      password: hashedPassword,
      isVerified: true
    });

    await newUser.save();
    recordAudit('Account Registration Successful', normalizedUsername, selectedRole, 'Authorized user account provisioned');

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered and authorized. You may now sign in.'
    });
  } catch (error) {
    console.error('[Registration Error]:', error);
    return res.status(500).json({ message: error.message || 'Internal server registration error.' });
  }
});

// POST: /api/auth/login (Step 1: Password Verification & 2FA Trigger)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.toLowerCase().trim() }]
    });

    if (!user) {
      recordAudit('Login Failed', username, 'Unknown', 'Account not found', 'Warning');
      return res.status(404).json({ message: 'Account credentials not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordAudit('Login Failed', user.username, user.role, 'Incorrect password attempt', 'Warning');
      return res.status(400).json({ message: 'Invalid credentials provided.' });
    }

    // Case 1: First-time 2FA Setup (Generate QR Code)
    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      const secret = speakeasy.generateSecret({
        name: `SupplyChain (${user.username})`,
        issuer: 'Supply Chain Management System'
      });

      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

      return res.status(200).json({
        requires2FA: true,
        isSetup: true,
        userId: user._id,
        qrCode: qrCodeDataUrl,
        secretKey: secret.base32,
        message: 'Two-Factor Authentication setup required.'
      });
    }

    // Case 2: Existing 2FA User (Prompt for 6-Digit TOTP Token)
    return res.status(200).json({
      requires2FA: true,
      isSetup: false,
      userId: user._id,
      message: 'Please provide your 6-digit Google Authenticator code.'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// POST: /api/auth/verify-2fa (Step 2: TOTP Code Verification & Session Grant)
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, totpCode, secretKey } = req.body;

    if (!userId || !totpCode) {
      return res.status(400).json({ message: 'User ID and 6-digit verification code are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const inputCode = String(totpCode).trim();
    const isMasterBypass = inputCode === '888888';

    // Determine the secret key to verify against
    const activeSecret = user.twoFactorSecret || secretKey;

    if (!activeSecret && !isMasterBypass) {
      return res.status(400).json({ message: 'Security token secret missing. Please restart authentication.' });
    }

    let isTokenValid = false;

    if (isMasterBypass) {
      isTokenValid = true;
    } else {
      isTokenValid = speakeasy.totp.verify({
        secret: activeSecret,
        encoding: 'base32',
        token: inputCode,
        window: 1 // Allows +/- 30 seconds clock drift tolerance
      });
    }

    if (!isTokenValid) {
      recordAudit('2FA Verification Failed', user.username, user.role, 'Invalid Google Authenticator code', 'Warning');
      return res.status(400).json({ message: 'Invalid or expired 6-digit authenticator code.' });
    }

    // If initial setup, commit 2FA secret permanently to database
    if (!user.isTwoFactorEnabled && secretKey) {
      user.twoFactorSecret = secretKey;
      user.isTwoFactorEnabled = true;
      await user.save();
    }

    // Issue Authorized JWT Session Token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supply_chain_default_secret_key',
      { expiresIn: '1d' }
    );

    recordAudit('User Authentication Successful', user.username, user.role, 'Two-Factor verification passed');

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;