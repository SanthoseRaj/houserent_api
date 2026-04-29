const nodemailer = require('nodemailer');
const env = require('../config/env');

const hasSmtpConfig = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log('SMTP not configured. Email skipped.', { to, subject, text });
    return false;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  });

  return true;
};

const sendOtpEmail = async ({ to, name, otp, purpose }) =>
  sendEmail({
    to,
    subject: `Your ${purpose} OTP`,
    text: `Hello ${name || 'there'}, your OTP for ${purpose} is ${otp}. It expires in ${env.otpExpiryMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #123047;">
        <h2 style="margin-bottom: 12px;">HouseRent verification</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your OTP for <strong>${purpose}</strong> is:</p>
        <div style="font-size: 32px; letter-spacing: 4px; font-weight: 700; margin: 20px 0;">${otp}</div>
        <p>This code expires in ${env.otpExpiryMinutes} minutes.</p>
      </div>
    `,
  });

module.exports = {
  hasSmtpConfig,
  sendEmail,
  sendOtpEmail,
};
