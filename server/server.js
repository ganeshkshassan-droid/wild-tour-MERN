require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { verifyEmailTransporter } = require('./utils/emailService');

// Verify Critical Security Variables on Boot
if (!process.env.JWT_SECRET) {
  console.warn('[SECURITY WARNING]: JWT_SECRET not found in env, using secure default fallback.');
  process.env.JWT_SECRET = 'wildtour_super_secret_jwt_encryption_key_2026_xyz';
}

// Connect to Database & Verify Email Transporter
connectDB();
verifyEmailTransporter();

const app = express();

// 1. Production HTTP Security Headers (Helmet with Custom CSP)
const rawFrontendUrls = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...rawFrontendUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://images.unsplash.com',
          'https://lh3.googleusercontent.com',
          'https://*.googleusercontent.com',
        ],
        connectSrc: [
          "'self'",
          'https://accounts.google.com',
          'https://oauth2.googleapis.com',
          'http://localhost:5000',
          'http://localhost:5173',
          ...rawFrontendUrls,
        ],
        frameSrc: ["'self'", 'https://accounts.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Controlled Environment CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV === 'development' ||
        allowedOrigins.includes('*');

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked]: Origin "${origin}" not in allowed list:`, allowedOrigins);
        callback(new Error('Cross-Origin Request Blocked by Wild Tour Security Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Parsing & Logger
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting Middleware
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this network. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 verification attempts per window
  message: {
    success: false,
    message: 'Too many verification code attempts. Please wait 15 minutes or request a fresh OTP.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6, // 6 resend attempts per window
  message: {
    success: false,
    message: 'Maximum verification resend requests exceeded. Please wait 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply Rate Limiters to Specific Auth Endpoints
app.use('/api/auth/login', generalAuthLimiter);
app.use('/api/auth/register', generalAuthLimiter);
app.use('/api/auth/verify-otp', otpVerifyLimiter);
app.use('/api/auth/verify-email-otp', otpVerifyLimiter);
app.use('/api/auth/verify-reset-otp', otpVerifyLimiter);
app.use('/api/auth/forgot-password', otpResendLimiter);
app.use('/api/auth/resend-otp', otpResendLimiter);
app.use('/api/auth/resend-verification-link', otpResendLimiter);

// 5. Routes Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/safaris', require('./routes/safariRoutes'));
app.use('/api/stays', require('./routes/stayRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/wildlife', require('./routes/wildlifeRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin/audit', require('./routes/adminLogRoutes'));

// 6. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Wild Tour Karnataka - Eco-Tourism Booking API Server',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// 7. Serve React Client Static Build in Production / Monorepo Mode
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 8. Custom 404 Handler for Unhandled API Routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// 9. Centralized Mongoose & Application Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error on ${req.method} ${req.originalUrl}]:`, err.message);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: err.errors,
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid resource identifier: ${err.value}`,
    });
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists in the system.`,
    });
  }

  // CORS Error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Default Error Envelope (Hide stack traces in production)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Sanctuary Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`[Wild Tour Server running on ${HOST}:${PORT}]`);
});

module.exports = app;

