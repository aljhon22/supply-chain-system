const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// ==========================================
// GET ALL SYSTEM AUDIT LOGS
// Route: GET /api/audit
// ==========================================
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1, _id: -1 });
    return res.status(200).json(logs);
  } catch (err) {
    console.error('[Audit API Error] GET / failed:', err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve system audit logs from database.'
    });
  }
});

// ==========================================
// RECORD NEW AUDIT LOG ENTRY
// Route: POST /api/audit
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { action, role, details } = req.body;
    const newLog = new AuditLog({
      action: action || 'System Event',
      role: role || 'Admin',
      details: details || 'Automated activity logged',
      timestamp: new Date().toLocaleString()
    });
    const savedLog = await newLog.save();
    return res.status(201).json(savedLog);
  } catch (err) {
    console.error('[Audit API Error] POST / failed:', err.message);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to record audit log entry.'
    });
  }
});

module.exports = router;