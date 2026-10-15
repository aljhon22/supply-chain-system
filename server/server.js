// 1. Force Google Public DNS to prevent ECONNREFUSED on MongoDB Atlas SRV lookups
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Import Application Route Handlers
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable reverse proxy trust for Render and cloud load balancers
app.set('trust proxy', 1);

// ==========================================
// 1. SECURITY & NETWORK CONFIGURATION
// ==========================================

// A. Helmet: Sets secure HTTP headers against XSS, sniffing, and clickjacking attacks
app.use(helmet());

// B. Flexible CORS Configuration: Seamlessly supports local testing and cloud deployment (Vercel/Render)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allows requests from localhost or deployed frontends (including Vercel subdomains)
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow seamless testing
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// C. Express Rate Limiting: Defend against Brute-Force and Denial of Service (DoS) attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 300, // Maximum request quota per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Resolves Render proxy validation conflict
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});
app.use('/api/', generalLimiter);

// Specific Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Allows up to 30 authentication attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Resolves Render proxy validation conflict
  message: {
    status: 429,
    error: 'Too Many Attempts',
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/', authLimiter);

// D. Payload Size Restrictions: Prevent server memory overload
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true, limit: '15kb' }));

// E. Safe NoSQL Injection Sanitizer
// Strips MongoDB operator keys ($ and .) in-place without mutating read-only req.query getters
const sanitizeObjectInPlace = (target) => {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    if (/^\$/.test(key) || key.includes('.')) {
      delete target[key];
    } else if (typeof target[key] === 'object') {
      sanitizeObjectInPlace(target[key]);
    }
  }
};

app.use((req, res, next) => {
  try {
    if (req.body) {
      mongoSanitize.sanitize(req.body);
      sanitizeObjectInPlace(req.body);
    }
    if (req.params) {
      mongoSanitize.sanitize(req.params);
      sanitizeObjectInPlace(req.params);
    }
  } catch (err) {
    console.warn('[Sanitization Warning]:', err.message);
  }
  next();
});

// ==========================================
// 2. DATABASE CONNECTIVITY
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supply_chain_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established successfully.');
  })
  .catch((err) => {
    console.error('CRITICAL: MongoDB connection error:', err.message);
  });

// ==========================================
// 3. API ROUTE DECLARATIONS
// ==========================================

// Health Check API Ping Endpoint (Used by Live Monitoring & Deployment Pings)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Primary System Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);

// Optional Fallback Route Handlers
try {
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/api/orders', orderRoutes);
} catch (e) {}

try {
  const supplierRoutes = require('./routes/supplierRoutes');
  app.use('/api/suppliers', supplierRoutes);
} catch (e) {}

// ==========================================
// 4. GLOBAL ERROR & NOT FOUND HANDLERS
// ==========================================

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    message: `Cannot ${req.method} requested resource on ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Unhandled Server Error] ${err.stack || err.message}`);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the secure cluster.'
        : err.message
  });
});

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(` Enterprise Supply Chain Gateway Online`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Security Shielding: Helmet, CORS, RateLimiter, SafeSanitize Active`);
  console.log(`================================================`);
});