const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, text }) => {
  // If credentials are not set in .env, print OTP as a fail-safe fallback
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("\n========================================================");
    console.warn("[WARNING] EMAIL_USER and EMAIL_PASS are not configured in .env.");
    console.warn("Skipping real email dispatch. OTP fallback console output:");
    console.warn(`To: ${email}`);
    console.warn(`Subject: ${subject}`);
    console.warn(`Message: ${text}`);
    console.warn("========================================================\n");
    return false;
  }

  // Create Transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Eng.Journal Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = sendEmail;
