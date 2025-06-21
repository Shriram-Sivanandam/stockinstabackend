require('dotenv').config();
const nodemailer = require('nodemailer');
const {createOTPEmailTemplate} = require('../emails/createOTPEmailTemplate');

const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendOTPEmail = async (to, otpCode) => {
  const subject = 'Your OTP Code';
  const htmlContent = createOTPEmailTemplate(otpCode);
  await sendEmail(to, subject, htmlContent);
};

module.exports = { sendOTPEmail };
