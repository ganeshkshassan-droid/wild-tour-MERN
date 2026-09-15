const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AUTH_TOKEN_EXPIRY } = require('../config/constants');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is not defined!');
  }
  return secret;
};

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select(
        '-password -resetOtpHash -verificationOtpHash -verificationTokenHash -resetTokenHash'
      );

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account no longer exists' });
      }

      // Check if user changed password after token was issued
      if (req.user.passwordChangedAt && decoded.iat) {
        const changedTimestamp = parseInt(req.user.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({
            success: false,
            message: 'User password was recently updated. Please sign in again.',
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized: token is invalid or expired' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Chief Warden admin privileges required' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: AUTH_TOKEN_EXPIRY || '30d',
  });
};

module.exports = { protect, adminOnly, generateToken, getJwtSecret };

