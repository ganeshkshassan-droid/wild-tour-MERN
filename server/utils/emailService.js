const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

// Reusable Transporter Singleton
let transporterInstance = null;

const getTransporter = () => {
  if (transporterInstance) return transporterInstance;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // false for port 587
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  return transporterInstance;
};

/**
 * Verify Transporter connection safely on startup
 */
exports.verifyEmailTransporter = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Email service configuration failed: Missing SMTP_USER or SMTP_PASS');
      return { configured: false, ready: false, message: 'SMTP credentials missing' };
    }
    console.log('ℹ️ [Email Service] SMTP credentials not set. Running in development mode with console fallback.');
    return { configured: false, ready: false, message: 'Development console fallback active' };
  }

  try {
    await transporter.verify();
    console.log('✅ Email service configured and ready');
    return { configured: true, ready: true };
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
    return { configured: true, ready: false, error: error.message };
  }
};

/**
 * Send Account Verification Email (with direct Link and backup 6-digit OTP)
 */
exports.sendVerificationEmail = async ({ to, name, token, otp }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Wild Tour Karnataka" <verify@wildtour.com>';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Wild Tour Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf6; color: #1e293b; margin: 0; padding: 20px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: #1b4332; padding: 30px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 2px; margin: 0; }
        .logo-subtitle { font-size: 11px; color: #a7f3d0; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn-primary { background-color: #1b4332; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(27, 67, 50, 0.25); }
        .divider-row { display: flex; align-items: center; text-align: center; margin: 24px 0; color: #94a3b8; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
        .divider-row::before, .divider-row::after { content: ''; flex: 1; border-bottom: 1px solid #e2e8f0; }
        .divider-row span { padding: 0 10px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1b4332; font-family: monospace; }
        .otp-expiry { font-size: 12px; color: #d97706; margin-top: 6px; font-weight: 600; }
        .link-text { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 20px; }
        .notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo-title">WILDTOUR KARNATAKA</div>
          <div class="logo-subtitle">Nagarhole & Kabini National Park</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || 'Explorer'},</div>
          <p class="text">
            Thank you for creating your Wild Tour account! To complete your registration and activate your verified safari booking privileges, please verify your email address.
          </p>

          <div class="btn-container">
            <a href="${verificationLink}" class="btn-primary" target="_blank">
              Verify My Email Address &rarr;
            </a>
          </div>

          <div class="divider-row">
            <span>OR ENTER 6-DIGIT OTP</span>
          </div>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">Valid for 10 minutes • Single use</div>
          </div>

          <p class="link-text">
            If the button above does not work, copy and paste this verification link into your browser:<br/>
            <a href="${verificationLink}" style="color: #1b4332;">${verificationLink}</a>
          </p>

          <div class="notice">
            🔒 <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you did not create an account on Wild Tour, please ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Wild Tour Karnataka. Dammanakatte Gate Reception.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: 'Verify Your Email Address - Wild Tour Karnataka',
        html: htmlContent,
      });
      console.log(`[Email Service] Delivered Verification Email to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, method: 'smtp' };
    } catch (err) {
      console.error(`[Email Service SMTP Error for ${to}]:`, err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  }

  // Development Fallback Only
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMTP email service is not configured on production.');
  }

  console.log('\n==================================================');
  console.log(`🌲 [WILDTOUR VERIFICATION EMAIL DISPATCHED] 🌲`);
  console.log(`To: ${to}`);
  console.log(`Recipient: ${name || 'Explorer'}`);
  console.log(`🔗 VERIFICATION LINK: ${verificationLink}`);
  console.log(`🔐 6-DIGIT OTP CODE: >> ${otp} << (Valid for 10 min)`);
  console.log('==================================================\n');

  return { success: true, method: 'console', verificationLink, otp };
};

/**
 * Send 6-digit OTP verification email (e.g. for password reset)
 */
exports.sendOtpEmail = async ({ to, name, otp, purpose = 'Password Reset' }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Wild Tour Karnataka" <security@wildtour.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Verification Code - Wild Tour</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf6; color: #1e293b; margin: 0; padding: 20px; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: #1b4332; padding: 28px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin: 0; }
        .subtitle { font-size: 11px; color: #a7f3d0; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1b4332; font-family: monospace; }
        .otp-expiry { font-size: 13px; color: #d97706; margin-top: 8px; font-weight: 600; }
        .notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo-title">WILDTOUR KARNATAKA</div>
          <div class="subtitle">Nagarhole & Kabini National Park</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || 'Explorer'},</div>
          <p class="text">
            We received a request for <strong>${purpose}</strong> on your Wild Tour account. Please use the 6-digit verification code below to proceed:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">Valid for 10 minutes only • Single use</div>
          </div>
          <div class="notice">
            🔒 <strong>Security Notice:</strong> Never share this verification code with anyone. Wild Tour staff and rangers will never request your code.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Wild Tour Karnataka. Dammanakatte Gate Reception.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: `[Wild Tour] Your 6-Digit Verification Code: ${otp}`,
        html: htmlContent,
      });
      console.log(`[Email Service] Delivered OTP to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, method: 'smtp' };
    } catch (err) {
      console.error(`[Email Service SMTP Error for ${to}]:`, err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMTP email service is not configured on production.');
  }

  console.log('\n==================================================');
  console.log(`🌲 [WILDTOUR OTP NOTIFICATION] 🌲`);
  console.log(`To: ${to}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`🔐 6-DIGIT OTP: >> ${otp} << (Valid for 10 min)`);
  console.log('==================================================\n');

  return { success: true, method: 'console', otp };
};

/**
 * Send Welcome Email After Successful Registration & Verification
 */
exports.sendWelcomeEmail = async ({ to, name }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Wild Tour Karnataka" <welcome@wildtour.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Wild Tour!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf6; color: #1e293b; margin: 0; padding: 20px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: #1b4332; padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 24px; font-weight: 800; letter-spacing: 2px; margin: 0; }
        .logo-subtitle { font-size: 11px; color: #a7f3d0; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .hero-banner { background: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 20px 24px; text-align: center; }
        .hero-banner h2 { color: #1b4332; margin: 0 0 4px 0; font-size: 20px; }
        .hero-banner p { color: #047857; margin: 0; font-size: 13px; font-weight: 600; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
        .text { font-size: 15px; line-height: 1.65; color: #475569; margin-bottom: 18px; }
        .welcome-quote { background: #f8faf6; border-left: 4px solid #1b4332; padding: 16px 20px; border-radius: 8px; margin: 24px 0; font-style: italic; color: #334155; font-size: 14px; line-height: 1.6; }
        .cta-box { text-align: center; margin: 30px 0 10px 0; }
        .btn-cta { background: #1b4332; color: #ffffff !important; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo-title">WILDTOUR KARNATAKA</div>
          <div class="logo-subtitle">Nagarhole & Kabini National Park</div>
        </div>
        <div class="hero-banner">
          <h2>🌿 Welcome to the Wilderness!</h2>
          <p>Your verified explorer account is now active.</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || 'Explorer'},</div>
          <p class="text">
            Thank you for registering with <strong>Wild Tour</strong>! We’re excited to have you with us and hope you have an amazing experience exploring and planning your journeys.
          </p>

          <div class="welcome-quote">
            “The wilderness holds answers to questions man has not yet learned how to ask.” — Nagarhole Tiger Reserve
          </div>

          <div class="cta-box">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/safaris" class="btn-cta" target="_blank">Explore Safari Permits &rarr;</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Wild Tour Karnataka. Dammanakatte Gate Reception, Kabini Range.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: 'Welcome to Wild Tour!',
        html: htmlContent,
      });
      console.log(`[Email Service] Delivered Welcome Email to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, method: 'smtp' };
    } catch (err) {
      console.error(`[Email Service Welcome Error for ${to}]:`, err.message);
      // Non-fatal for welcome emails, but logged
      return { success: false, error: err.message };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌲 [WILDTOUR DEV WELCOME EMAIL DISPATCHED] To: ${to}`);
  }
  return { success: true, method: 'console' };
};

/**
 * Send Official Safari / Stay Booking Confirmation Email (E-Permit)
 */
exports.sendBookingConfirmationEmail = async ({ to, booking, user }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Wild Tour Karnataka" <bookings@wildtour.com>';

  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : booking.from_date
    ? `${new Date(booking.from_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${booking.to_date ? new Date(booking.to_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`
    : 'Confirmed Schedule';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Wild Tour Karnataka</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf6; color: #1e293b; margin: 0; padding: 20px; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: #1b4332; padding: 28px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 2px; margin: 0; }
        .logo-subtitle { font-size: 11px; color: #a7f3d0; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .hero-banner { background: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 18px 24px; text-align: center; }
        .hero-banner h2 { color: #1b4332; margin: 0 0 4px 0; font-size: 19px; }
        .hero-banner p { color: #047857; margin: 0; font-size: 13px; font-weight: 600; }
        .content { padding: 30px 26px; }
        .ticket-badge { background: #1b4332; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; display: inline-block; margin-bottom: 14px; }
        .booking-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
        .booking-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
        .booking-table td.label { color: #64748b; font-weight: 600; width: 40%; }
        .booking-table td.value { color: #0f172a; font-weight: 700; text-align: right; }
        .price-row { background: #ecfdf5; font-size: 16px !important; color: #047857 !important; }
        .gate-notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #92400e; line-height: 1.5; margin: 22px 0; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo-title">WILDTOUR KARNATAKA</div>
          <div class="logo-subtitle">Nagarhole & Kabini National Park</div>
        </div>
        <div class="hero-banner">
          <h2>🎟️ Booking Confirmed & Verified!</h2>
          <p>Your official sanctuary permit is active.</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="ticket-badge">PERMIT REF: ${booking.ticket_number || 'WT-' + booking._id.toString().slice(-6).toUpperCase()}</div>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
            Hello <strong>${booking.tourist_name || user?.name || 'Explorer'}</strong>, your booking for <strong>${booking.item_name}</strong> has been successfully confirmed. Please find your summary below:
          </p>

          <table class="booking-table">
            <tr>
              <td class="label">Expedition / Item</td>
              <td class="value">${booking.item_name} (${booking.item_type})</td>
            </tr>
            <tr>
              <td class="label">Lead Traveler</td>
              <td class="value">${booking.tourist_name}</td>
            </tr>
            <tr>
              <td class="label">Date / Schedule</td>
              <td class="value">${formattedDate}</td>
            </tr>
            <tr>
              <td class="label">Number of Guests</td>
              <td class="value">${booking.num_persons} Person(s)</td>
            </tr>
            <tr>
              <td class="label">Payment Mode</td>
              <td class="value">${booking.payment_mode || 'UPI / NetBanking'} (Paid)</td>
            </tr>
            <tr class="price-row">
              <td class="label" style="color: #047857;">Total Amount Paid</td>
              <td class="value" style="color: #047857; font-size: 17px;">₹${Number(booking.total_price).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div class="gate-notice">
            📍 <strong>Boarding & Reception:</strong> Dammanakatte Gate Reception Counter, Kabini Range, Nagarhole National Park. Please arrive 30 minutes prior to scheduled departure with a valid Government ID (Aadhaar, Passport, or Voter ID).
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Wild Tour Karnataka. Karnataka Forest Department Authorized Booking Gateway.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: `[Wild Tour] Booking Confirmed: ${booking.item_name} (Ref: ${booking.ticket_number})`,
        html: htmlContent,
      });
      console.log(`[Email Service] Delivered Booking Confirmation to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, method: 'smtp' };
    } catch (err) {
      console.error(`[Email Service Booking Error for ${to}]:`, err.message);
      return { success: false, error: err.message };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌲 [WILDTOUR DEV BOOKING CONFIRMATION EMAIL] To: ${to}, Ticket: ${booking.ticket_number}`);
  }
  return { success: true, method: 'console' };
};

/**
 * Send Official Safari / Stay Booking Cancellation Email (with Refund Status)
 */
exports.sendBookingCancellationEmail = async ({ to, booking, user }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Wild Tour Karnataka" <bookings@wildtour.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled - Wild Tour Karnataka</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf6; color: #1e293b; margin: 0; padding: 20px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: #1b4332; padding: 28px 24px; text-align: center; color: #ffffff; }
        .logo-title { font-size: 22px; font-weight: 800; letter-spacing: 2px; margin: 0; }
        .logo-subtitle { font-size: 11px; color: #a7f3d0; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .hero-banner { background: #fef2f2; border-bottom: 1px solid #fecaca; padding: 18px 24px; text-align: center; }
        .hero-banner h2 { color: #991b1b; margin: 0 0 4px 0; font-size: 19px; }
        .hero-banner p { color: #b91c1c; margin: 0; font-size: 13px; font-weight: 600; }
        .content { padding: 30px 26px; }
        .cancel-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
        .cancel-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
        .cancel-table td.label { color: #64748b; font-weight: 600; width: 40%; }
        .cancel-table td.value { color: #0f172a; font-weight: 700; text-align: right; }
        .refund-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0; }
        .refund-title { font-size: 14px; font-weight: 800; color: #166534; margin-bottom: 4px; }
        .refund-text { font-size: 13px; color: #15803d; line-height: 1.5; margin: 0; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo-title">WILDTOUR KARNATAKA</div>
          <div class="logo-subtitle">Nagarhole & Kabini National Park</div>
        </div>
        <div class="hero-banner">
          <h2>🚫 Booking Cancellation Notice</h2>
          <p>Your reservation has been cancelled as requested.</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
            Hello <strong>${booking.tourist_name || user?.name || 'Explorer'}</strong>, this is an official notification that your booking for <strong>${booking.item_name}</strong> has been cancelled.
          </p>

          <table class="cancel-table">
            <tr>
              <td class="label">Booking Reference</td>
              <td class="value">${booking.ticket_number || 'WT-' + booking._id.toString().slice(-6).toUpperCase()}</td>
            </tr>
            <tr>
              <td class="label">Cancelled Item</td>
              <td class="value">${booking.item_name}</td>
            </tr>
            <tr>
              <td class="label">Cancellation Date</td>
              <td class="value">${new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td class="label">Refund Status</td>
              <td class="value" style="color: #059669;">Refund Initiated (100%)</td>
            </tr>
            <tr>
              <td class="label">Refund Amount</td>
              <td class="value">₹${Number(booking.total_price).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div class="refund-box">
            <div class="refund-title">💳 Refund Processing</div>
            <p class="refund-text">
              The full refund of <strong>₹${Number(booking.total_price).toLocaleString('en-IN')}</strong> has been processed to your original payment mode (${booking.payment_mode || 'UPI / NetBanking'}). It will reflect in your account within 3 to 5 business days.
            </p>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Wild Tour Karnataka. Dammanakatte Gate Reception.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: `[Wild Tour] Booking Cancelled: ${booking.item_name} (Ref: ${booking.ticket_number})`,
        html: htmlContent,
      });
      console.log(`[Email Service] Delivered Booking Cancellation to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, method: 'smtp' };
    } catch (err) {
      console.error(`[Email Service Cancellation Error for ${to}]:`, err.message);
      return { success: false, error: err.message };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌲 [WILDTOUR DEV BOOKING CANCELLATION EMAIL] To: ${to}, Ticket: ${booking.ticket_number}`);
  }
  return { success: true, method: 'console' };
};

