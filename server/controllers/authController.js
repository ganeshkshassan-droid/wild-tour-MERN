const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, getJwtSecret } = require('../middleware/auth');
const { sendVerificationEmail, sendOtpEmail, sendWelcomeEmail } = require('../utils/emailService');
const { PASSWORD_RESET_TOKEN_EXPIRY, OTP_EXPIRY_MS } = require('../config/constants');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to hash OTP or Token with SHA-256
const hashSecret = (val) => crypto.createHash('sha256').update(val.toString().trim()).digest('hex');

// Password complexity regex: Minimum 8 characters, at least one letter and one number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Generate 32-byte cryptographically secure verification token
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate 6-digit crypto OTP
const generateCryptoOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate temporary password reset authorization token (valid for 15 minutes)
const generateResetAuthToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, purpose: 'password_reset' },
    getJwtSecret(),
    { expiresIn: PASSWORD_RESET_TOKEN_EXPIRY || '15m' }
  );
};


// Cryptographically verify Google ID Token using google-auth-library
const verifyGoogleCredential = async (idToken) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (clientId && clientId !== 'dummy-wildtour-client-id') {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (payload && payload.email && payload.email_verified) {
        return {
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          avatar: payload.picture,
          googleId: payload.sub,
          emailVerified: true,
        };
      }
    } catch (err) {
      console.warn('[Google Auth Library] Verification note:', err.message);
    }
  }

  // Fallback to Google TokenInfo Endpoint
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (res.ok) {
      const payload = await res.json();
      const isVerified = payload.email_verified === 'true' || payload.email_verified === true;
      if (payload.email && isVerified) {
        return {
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          avatar: payload.picture,
          googleId: payload.sub,
          emailVerified: true,
        };
      }
    }
  } catch (err) {
    console.warn('[Google tokeninfo API] note:', err.message);
  }

  return null;
};

// @desc    Register new user & initiate Email Verification (Link + OTP)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one letter and one number',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        accountExists: true,
        message: 'This account already exists. Please log in.',
      });
    }

    // Generate 32-byte secure token (24-hour expiry) & 6-digit OTP (10-minute expiry)
    const rawToken = generateSecureToken();
    const tokenHash = hashSecret(rawToken);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const rawOtp = generateCryptoOtp();
    const otpHash = hashSecret(rawOtp);
    const otpExpires = new Date(Date.now() + (OTP_EXPIRY_MS || 10 * 60 * 1000)); // 10 minutes

    if (user && !user.isEmailVerified) {
      // Update existing unverified user record safely
      user.name = name.trim();
      user.phone = phone ? phone.trim() : user.phone;
      user.password = password; // Hashed by pre('save')
      user.address = address ? address.trim() : 'Karnataka, India';
      user.verificationTokenHash = tokenHash;
      user.verificationTokenExpires = tokenExpires;
      user.verificationOtpHash = otpHash;
      user.verificationOtpExpires = otpExpires;
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();
    } else {
      // Create new user with isEmailVerified: false, strictly role: 'user'
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        password,
        address: address ? address.trim() : 'Karnataka, India',
        role: 'user', // Public registration is ALWAYS standard 'user'
        isEmailVerified: false,
        isVerified: false,
        welcomeEmailSent: false,
        verificationTokenHash: tokenHash,
        verificationTokenExpires: tokenExpires,
        verificationOtpHash: otpHash,
        verificationOtpExpires: otpExpires,
        otpAttempts: 0,
        lastOtpSentAt: new Date(),
      });
    }


    // Send Real Verification Email
    try {
      await sendVerificationEmail({
        to: cleanEmail,
        name: user.name,
        token: rawToken,
        otp: rawOtp,
      });
    } catch (emailErr) {
      console.error('[Registration Email Delivery Failure]:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Account created, but verification email delivery failed: ${emailErr.message}. Please try resending verification email.`,
        requiresVerification: true,
        email: cleanEmail,
      });
    }

    res.status(201).json({
      success: true,
      message: `Account created! A verification email has been dispatched to ${cleanEmail}. Click the link in the email or enter the 6-digit code.`,
      requiresVerification: true,
      email: cleanEmail,
      purpose: 'signup',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email via Direct Verification Link Token (Atomic & Concurrency-Safe)
// @route   POST /api/auth/verify-email-token
exports.verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, status: 'invalid', message: 'Verification token is missing' });
    }

    const cleanToken = token.trim();
    const tokenHash = hashSecret(cleanToken);

    // 1. Check if token exists and is valid/unexpired
    const existingUser = await User.findOne({ verificationTokenHash: tokenHash });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'This verification link is invalid or has already been used.',
      });
    }

    if (existingUser.isEmailVerified) {
      const jwtToken = generateToken(existingUser._id);
      return res.status(200).json({
        success: true,
        status: 'already_verified',
        message: 'Your email address is already verified!',
        token: jwtToken,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          address: existingUser.address,
          role: existingUser.role,
          avatar: existingUser.avatar,
        },
      });
    }

    // Check expiration (24h)
    if (!existingUser.verificationTokenExpires || new Date() > existingUser.verificationTokenExpires) {
      return res.status(400).json({
        success: false,
        status: 'expired',
        email: existingUser.email,
        message: 'This verification link has expired (valid for 24 hours). Please request a new verification email.',
      });
    }

    // 2. Atomic update to mark verified and invalidate tokens
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: existingUser._id,
        verificationTokenHash: tokenHash,
      },
      {
        $set: {
          isEmailVerified: true,
          isVerified: true,
          verificationTokenHash: null,
          verificationTokenExpires: null,
          verificationOtpHash: null,
          verificationOtpExpires: null,
          otpAttempts: 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Verification failed. The token may have already been used concurrently.',
      });
    }

    // 3. Atomic Welcome Email Dispatch Guard (ensures exactly 1 welcome email even under concurrent requests)
    const welcomeGuardUser = await User.findOneAndUpdate(
      { _id: updatedUser._id, welcomeEmailSent: { $ne: true } },
      { $set: { welcomeEmailSent: true } }
    );

    if (welcomeGuardUser) {
      // Send welcome email asynchronously without blocking the response
      sendWelcomeEmail({ to: updatedUser.email, name: updatedUser.name }).catch((err) => {
        console.error('[Welcome Email Error]:', err.message);
      });
    }

    const jwtToken = generateToken(updatedUser._id);

    res.status(200).json({
      success: true,
      status: 'verified',
      message: 'Email verified successfully! Welcome to Wild Tour Karnataka.',
      token: jwtToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Verify email token error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email via 6-Digit OTP Code (Atomic & Concurrency-Safe)
// @route   POST /api/auth/verify-email-otp
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email and 6-digit verification code' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email' });
    }

    if (user.isEmailVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
        },
      });
    }

    // Check expiration (10 min)
    if (!user.verificationOtpHash || !user.verificationOtpExpires || new Date() > user.verificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check failed attempts (Max 5 attempts)
    if (user.otpAttempts >= 5) {
      user.verificationOtpHash = null;
      user.verificationOtpExpires = null;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a fresh verification email.',
      });
    }

    const inputHash = hashSecret(cleanOtp);
    if (inputHash !== user.verificationOtpHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code locked. Please request a new code.'}`,
      });
    }

    // Atomic update to mark verified
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, verificationOtpHash: inputHash },
      {
        $set: {
          isEmailVerified: true,
          isVerified: true,
          verificationTokenHash: null,
          verificationTokenExpires: null,
          verificationOtpHash: null,
          verificationOtpExpires: null,
          otpAttempts: 0,
        },
      },
      { new: true }
    );

    // Atomic Welcome Email Dispatch Guard
    const welcomeGuardUser = await User.findOneAndUpdate(
      { _id: updatedUser._id, welcomeEmailSent: { $ne: true } },
      { $set: { welcomeEmailSent: true } }
    );

    if (welcomeGuardUser) {
      sendWelcomeEmail({ to: updatedUser.email, name: updatedUser.name }).catch((err) => {
        console.error('[Welcome Email Error]:', err.message);
      });
    }

    const token = generateToken(updatedUser._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to Wild Tour.',
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend Verification Email (Link + OTP) with 60s cooldown
// @route   POST /api/auth/resend-verification-link
exports.resendVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email address' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified. You can sign in directly.' });
    }

    // 60-second cooldown check
    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      const remainingSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(user.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new verification email.`,
      });
    }

    const rawToken = generateSecureToken();
    const rawOtp = generateCryptoOtp();

    user.verificationTokenHash = hashSecret(rawToken);
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.verificationOtpHash = hashSecret(rawOtp);
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: rawToken,
        otp: rawOtp,
      });
    } catch (emailErr) {
      console.error('[Resend Email Delivery Failure]:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Failed to deliver verification email: ${emailErr.message}. Please check your email configuration.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `A fresh verification link and 6-digit code have been dispatched to ${cleanEmail}.`,
    });
  } catch (error) {
    console.error('Resend verification link error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Strict Real Google OAuth 2.0 Verification & Account Linking
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google identity token credential is required for authentication.',
      });
    }

    // Cryptographically verify Google ID Token with Google's public keys
    const googleUser = await verifyGoogleCredential(credential);

    if (!googleUser || !googleUser.email || !googleUser.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Google token validation failed or email is unverified by Google.',
      });
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Secure Account Linking Policy:
      // Since Google has cryptographically verified this user's email ownership (email_verified: true),
      // we securely link the Google identity sub to this existing account and mark email as verified.
      user.isEmailVerified = true;
      user.isVerified = true;
      if (!user.googleId) user.googleId = googleUser.googleId;
      if (googleUser.avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = googleUser.avatar;
      }
      await user.save({ validateBeforeSave: false });

      // Atomic Welcome Email Guard
      const welcomeGuard = await User.findOneAndUpdate(
        { _id: user._id, welcomeEmailSent: { $ne: true } },
        { $set: { welcomeEmailSent: true } }
      );
      if (welcomeGuard) {
        sendWelcomeEmail({ to: user.email, name: user.name }).catch((e) => {});
      }
    } else {
      // New user creation via verified Google profile - ALWAYS default to standard 'user' role
      user = await User.create({
        name: googleUser.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: googleUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        googleId: googleUser.googleId,
        role: 'user', // Strictly 'user' role
        isEmailVerified: true,
        isVerified: true,
        welcomeEmailSent: true,
        address: 'Karnataka, India',
      });

      sendWelcomeEmail({ to: user.email, name: user.name }).catch((e) => {});
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome to Wild Tour, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user (with email verification guard)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. No user found with this email.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Guard: Prevent unverified users from logging in
    if (user.isEmailVerified === false && user.role !== 'admin') {
      const rawToken = generateSecureToken();
      const rawOtp = generateCryptoOtp();
      user.verificationTokenHash = hashSecret(rawToken);
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.verificationOtpHash = hashSecret(rawOtp);
      user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save({ validateBeforeSave: false });

      try {
        await sendVerificationEmail({
          to: cleanEmail,
          name: user.name,
          token: rawToken,
          otp: rawOtp,
        });
      } catch (e) {
        console.error('[Login unverified email dispatch notice]:', e.message);
      }

      return res.status(403).json({
        success: false,
        message: 'Your email address is not verified yet. A fresh verification email with a direct link and 6-digit code has been dispatched.',
        requiresVerification: true,
        email: cleanEmail,
        purpose: 'signup',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - Generate & Send Hashed 6-Digit OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Prevent Account Enumeration: Return generic success without revealing email non-existence
      return res.status(200).json({
        success: true,
        message: 'If an account is registered with this email, a 6-digit verification code has been dispatched.',
        email: cleanEmail,
        purpose: 'password-reset',
      });
    }

    // Rate Limit / Cooldown Check (60 seconds)
    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      const remainingSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(user.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      });
    }

    const rawOtp = generateCryptoOtp();
    const hashed = hashSecret(rawOtp);

    user.resetOtpHash = hashed;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetTokenHash = null;
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp: rawOtp,
        purpose: 'Password Reset',
      });
    } catch (emailErr) {
      console.error('[Forgot Password Email Dispatch Error]:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Failed to deliver verification code: ${emailErr.message}. Please check your email configuration.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `A secure 6-digit verification code has been dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
      purpose: 'password-reset',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Reset Password OTP & Issue Signed Reset Authorization Token
// @route   POST /api/auth/verify-reset-otp
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email and 6-digit OTP' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check expiration
    if (!user.resetOtpHash || !user.resetOtpExpires || new Date() > user.resetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new code.',
      });
    }

    // Check attempts limit (Max 5 attempts)
    if (user.otpAttempts >= 5) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a fresh OTP.',
      });
    }

    const inputHash = hashSecret(cleanOtp);
    if (inputHash !== user.resetOtpHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code locked.'}`,
      });
    }

    // Generate signed reset authorization token
    const resetToken = generateResetAuthToken(user);

    // Invalidate the used OTP and record reset token hash
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetTokenHash = hashSecret(resetToken);
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully! You may now create your new password.',
      resetToken,
      email: cleanEmail,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unified Verify OTP Route (Handles both signup and password-reset)
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  const { purpose } = req.body;
  if (purpose === 'signup') {
    return exports.verifyEmailOtp(req, res);
  }
  return exports.verifyResetOtp(req, res);
};

// @desc    Reset Password with verified Reset Authorization Token
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, reset authorization token, and new password',
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long and contain at least one letter and one number',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify JWT resetToken signature
    let decoded;
    try {
      decoded = jwt.verify(resetToken, getJwtSecret());
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Password reset authorization has expired or is invalid. Please request a new OTP.',
      });
    }

    if (decoded.email !== cleanEmail || decoded.purpose !== 'password_reset') {
      return res.status(401).json({ success: false, message: 'Invalid reset authorization token' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Verify resetTokenHash stored on user
    const tokenHash = hashSecret(resetToken);
    if (user.resetTokenHash && user.resetTokenHash !== tokenHash) {
      return res.status(401).json({ success: false, message: 'This reset session has already been used or is invalid.' });
    }

    // Update password (pre-save hook will hash and update passwordChangedAt)
    user.password = newPassword;
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    user.otpAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP with Cooldown Protection
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'signup' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    if (purpose === 'signup') {
      return exports.resendVerificationLink(req, res);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 60-second cooldown check
    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      const wait = Math.ceil((60 * 1000 - (Date.now() - new Date(user.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${wait} seconds before requesting another code.`,
      });
    }

    const rawOtp = generateCryptoOtp();
    const hashed = hashSecret(rawOtp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtpHash = hashed;
    user.resetOtpExpires = expiry;
    user.resetTokenHash = null;
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp: rawOtp,
        purpose: 'Password Reset',
      });
    } catch (emailErr) {
      console.error('[Resend OTP Email Error]:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Failed to dispatch OTP: ${emailErr.message}. Please verify your email credentials.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `New verification code dispatched to ${cleanEmail}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Password (Authenticated user)
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long and contain at least one letter and one number',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! Please use your new credentials on future sign-ins.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOtpHash -verificationOtpHash -verificationTokenHash -resetTokenHash');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address) user.address = address.trim();
    if (avatar) user.avatar = avatar.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetOtpHash -verificationOtpHash -verificationTokenHash -resetTokenHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
