import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'devarapujames@gmail.com',
    pass: process.env.GMAIL_PASS || 'wxvwozsaxfwpwyfz'
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendOTP(email, otp) {
  console.log('Attempting to send email to:', email);
  console.log('Using Gmail user:', process.env.GMAIL_USER);
  
  const result = await transporter.sendMail({
    from: process.env.GMAIL_USER || 'devarapujames@gmail.com',
    to: email,
    subject: 'Password Reset OTP - Handmade by Tejasree',
    html: `
      <h2>Password Reset Request</h2>
      <p>Your password reset OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
  
  console.log('Email sent successfully:', result.messageId);
  return result;
}