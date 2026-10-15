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

// Resilient Transporter: Awtomatikong inaalis ang anumang space sa EMAIL_PASS at may 6s timeout
const createTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000
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
      return res.status(400).json({ message: 'Kulang ang mga kinakailangang impormasyon sa pagrehistro.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    // 1. Linisin muna ang anumang hindi pa na-verify na lumang registration para sa email o username na ito
    await User.deleteMany({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
      isVerified: { $ne: true }
    });

    // 2. Suriin kung mayroon nang aktibo at verified na account
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser && existingUser.isVerified) {
      const isEmailTaken = existingUser.email === normalizedEmail;
      return res.status(400).json({
        message: isEmailTaken
          ? 'Ang email na ito ay nakarehistro na. Mangyaring mag-sign in na lamang.'
          : 'Ang username na ito ay gamit na. Pumili ng ibang username.'
      });
    }

    // 3. I-hash ang password at buuin ang 6-digit OTP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const generatedCode = generateOTP();

    // I-save ang bagong OTP sa database
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otp: generatedCode,
      code: generatedCode,
      createdAt: new Date()
    });

    // 4. I-save ang user bilang unverified muna
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

    // I-log sa Render Terminal para kahit ma-delay ang Gmail sa defense, mababasa mo agad ang OTP!
    console.log('====================================================');
    console.log(`🔑 [REGISTER OTP LOG] Para kay: ${normalizedEmail}`);
    console.log(`👉 CODE: ${generatedCode}`);
    console.log('====================================================');

    // 5. Ipadala ang email sa background na may 5 segundong limit para hindi mag-hang ang frontend
    const sendMailPromise = async () => {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Supply Chain Logistics" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: 'Account Registration Verification Passcode',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #10b981;">Supply Chain Logistics Verification</h2>
            <p>Gamitin ang 6-digit verification code na ito upang makumpleto ang iyong pagpaparehistro:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a; padding: 15px 0;">
              ${generatedCode}
            </div>
            <p style="font-size: 13px; color: #64748b;">Mag-eexpire ang code na ito sa loob ng ilang minuto.</p>
          </div>
        `
      });
    };

    try {
      // Maghintay nang hanggang 5 segundo lamang para sa Gmail. Kung lumampas, huwag i-hang ang user!
      await Promise.race([
        sendMailPromise(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP response timeout')), 5000))
      ]);
      console.log(`✓ Email matagumpay na naipadala sa ${normalizedEmail}`);
    } catch (e) {
      console.warn(`[SMTP Warning]: Hindi agad nakasagot ang Gmail (${e.message}). Ang OTP ay nasa Render logs.`);
    }

    // Agad na sumagot sa browser upang lumipat sa /verify-otp screen
    return res.status(201).json({
      message: 'Registration initiated. Verification OTP sent.',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Registration processing error:', error);

    // Saluhin ang duplicate key kung may sumabay na request
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Mayroon nang account na gumagamit ng email o username na ito. Subukang mag-sign in.'
      });
    }

    return res.status(500).json({ message: error.message || 'Registration error.' });
  }
});

// Shared verification handler
const handleOtpVerification = async (req, res) => {
  try {
    const email = req.body.email;
    const inputOtp = (req.body.otp || req.body.code || '').toString().trim();

    if (!email || !inputOtp) {
      return res.status(400).json({ message: 'Kinakailangan ang Email at OTP code.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Hanapin ang OTP sa database O payagan ang Master Defense Code na "888888" para ligtas sa presentation
    const isMasterBypass = inputOtp === '888888';
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      $or: [{ otp: inputOtp }, { code: inputOtp }]
    });

    if (!otpRecord && !isMasterBypass) {
      await recordAudit('OTP Verification Failed', normalizedEmail, 'Guest', 'Invalid passcode attempt', 'Warning');
      return res.status(400).json({ message: 'Mali o expired na ang OTP verification code.' });
    }

    // I-activate ang user account
    const user = await User.findOneAndUpdate({ email: normalizedEmail }, { isVerified: true }, { new: true });
    await Otp.deleteMany({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Hindi natagpuan ang account para sa email na ito.' });
    }

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
      return res.status(404).json({ message: 'Hindi natagpuan ang account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await recordAudit('Login Failed', user.username, user.role, 'Incorrect password attempt', 'Warning');
      return res.status(400).json({ message: 'Maling username o password.' });
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

// GET: /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user list.' });
  }
});

// PUT: /api/auth/users/:id/role
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

// DELETE: /api/auth/users/:id
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